import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to compress image before sending to API
// Mobile photos are too large (5MB+) for the API payload usually.
// We resize to max 800px and 0.6 quality.
const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const MAX_SIZE = 800;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
          resolve(base64Str); // Fallback
          return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      // Compress to JPEG with 0.6 quality
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = (err) => reject(err);
  });
};

export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    // 1. Compress the image first
    console.log("Compressing image...");
    const compressedImage = await compressImage(base64Image);
    
    // 2. Remove header for API
    const cleanBase64 = compressedImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    
    console.log("Sending request to Gemini API...");
    
    // 3. Call API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
            {
                text: prompt
            },
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: cleanBase64
                }
            }
        ]
      }
    });

    // 4. Handle Response
    const candidate = response.candidates?.[0];
    
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                console.log("Image received from API");
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        // If we loop through parts and find no image, check for text (refusal)
        const textPart = candidate.content.parts.find(p => p.text);
        if (textPart && textPart.text) {
             console.warn("AI Refusal:", textPart.text);
             throw new Error("هوش مصنوعی درخواست را انجام نداد: " + textPart.text);
        }
    }

    throw new Error("تصویری توسط هوش مصنوعی تولید نشد.");
  } catch (error: any) {
    console.error("Gemini API Error Details:", error);
    
    // Safety Filter / Refusal
    if (error.message && (error.message.includes('Refusal') || error.message.includes('Safety'))) {
        throw new Error(`مدل هوش مصنوعی تصویر را رد کرد (فیلتر اخلاقی). لطفا از تصویر دیگری استفاده کنید.`);
    }
    
    // 400 Bad Request
    if (error.status === 400) {
        throw new Error("مشکل در ارسال تصویر. (فرمت نامناسب یا عدم تشخیص چهره)");
    }
    
    // 403 Forbidden (API Key or Region)
    if (error.status === 403) {
        throw new Error("دسترسی محدود شده است. (اگر در ایران هستید، لطفا VPN خود را بررسی کنید)");
    }
    
    // 503 Service Unavailable
    if (error.status === 503) {
        throw new Error("سرویس شلوغ است. لطفا چند ثانیه دیگر تلاش کنید.");
    }
    
    // Network Error (Fetch failed)
    if (error.message && error.message.includes('Failed to fetch')) {
         throw new Error("خطای شبکه. لطفا اتصال اینترنت و VPN خود را بررسی کنید.");
    }

    throw new Error("خطا: " + (error.message || "نامشخص"));
  }
};
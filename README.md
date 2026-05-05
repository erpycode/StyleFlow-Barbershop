**English** | [نسخه فارسی](./README_fa.md)

# StyleFlow Barbershop 💈 (By ErPyCode)

A modern, full-stack barbershop booking application designed with a focus on User Experience (UX) and User Interface (UI). This project is developed to be bilingual (Persian/English) and uses local storage for a seamless offline-first demo experience.

## 🚀 Key Features
- **Bilingual Support (i18n):** Seamlessly switch between Persian (RTL) and English (LTR) across the entire application.
- **Custom Branding:** Integrated **ErPyCode** personal branding and digital signatures throughout the UI.
- **Offline-First Storage:** Uses Browser LocalStorage to persist data without the need for a database (Perfect for portfolio demos).
- **Smart AI Assistant:** Integrated Google Gemini AI to answer customer queries and provide style consultations.
- **Advanced Admin Panel:** Complete management of services, appointments, and shop settings.

## ✒️ Digital Signature & Copyright
This project was designed and developed by **ErPyCode**.

**Usage Terms:**
You are free to use this project in your portfolio or for your own projects, provided that:
1. You credit the original developer (**ErPyCode**) in your project's Credits section or README file.
2. You do not remove the digital signatures present in the code or UI without permission.
3. If significant changes are made, please still link back to the original source.

## 🛠 Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS
- **State & Storage:** LocalStorage API
- **AI Integration:** Google Gemini API
- **Animations:** Framer Motion (via Motion for React)
- **Icons:** Lucide React

## 📦 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/ErPyCode/styleflow-barbershop.git
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file and add your Gemini API key:
```env
GEMINI_API_KEY=your_key_here
```

4. Run the development server:
```bash
npm run dev
```

## 🗄 Database Integration (Optional)
By default, this project uses `LocalStorage`. If you wish to connect it to a real database like Supabase:

1. Open `supabaseClient.ts` and initialize your Supabase client.
2. In `services/dataService.ts`, replace the LocalStorage logic with Supabase fetch/upsert calls.
3. Define your `bookings` and `services` tables following the structures mentioned in the project documentation.

## 🎨 Customization
- **Remove "About Project" Page:** Simply remove the `/about` route in `App.tsx` and hide the navigation items in `components/Layout.tsx`.
- **Update Contact Info:** Social links and contact details are located in `pages/AboutProject.tsx`.
- **Change Branding:** Project titles and banners can be updated in `services/LanguageContext.tsx`.

---
Crafted with ❤️ by @ErPyCode
<a href="https://github.com/ErPyCode">GitHub</a> | <a href="https://t.me/ErPyCode">Telegram</a> | <a href="mailto:ErPyCode@hotmail.com">Email</a>


## 👤 Admin Access
- **URL:** `/admin/login`
- **Default Username:** `admin`
- **Default Password:** `admin`

---
Designed for portfolio showcase.

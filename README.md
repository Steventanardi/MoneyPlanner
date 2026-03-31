# 💰 Money Planner — Premium Personal Finance Tracker

<div align="center">

![Money Planner Hero Banner](./docs/assets/hero_banner.png)

**Transform your financial life with clarity and style.**

[Live Demo](https://moneyplanner-demo.vercel.app/) • [Report Bug](https://github.com/Steventanardi/MoneyPlanner/issues) • [Request Feature](https://github.com/Steventanardi/MoneyPlanner/issues)

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

</div>

---

## 🌟 Overview

**Money Planner** is a high-end, privacy-conscious financial management application crafted for those who value both aesthetics and functionality. Built with **React 19**, **Vite**, and **Supabase**, it delivers a premium experience with glassmorphic visuals and smooth interactive elements.

Whether you're tracking daily expenses, managing multiple bank accounts, or planning for emergencies, Money Planner provides the tools you need in one beautiful interface.

---

## ✨ Features Key

### 📂 Smart Asset Management
- **🏦 Multi-Bank Support**: Track balances across personal, joint, and savings accounts.
- **🛡️ Emergency Fund**: Dedicated tracker with goal-based liquid reserve monitoring.
- **🔄 Recurring Transactions**: Automate tracking for subscriptions, bills, and regular income.

### 📊 Powerful Insights
- **📈 Interactive Charts**: Dynamic data visualization using **Recharts** (Area, Bar, and Pie).
- **🌍 Global Finance**: Real-time exchange rate updates for international travelers (TWD/IDR default).
- **📉 Spending Breakdown**: Detailed category-wise analysis of your financial habits.

### 💎 Premium User Experience
- **🎨 Glassmorphism & Dark Mode**: A stunning UI designed for modern readability.
- **✨ Micro-interactions**: Buttery-smooth transitions powered by **Framer Motion**.
- **📱 PWA Ready**: Install as a standalone app on your mobile device or desktop.
- **🚀 Ultra-fast Performance**: Powered by Vite and TanStack Query for instant data sync.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend/DB**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
- **Charts**: [Recharts](https://recharts.org/)
- **Utilities**: [Tesseract.js](https://tesseract.projectnaptha.com/) (OCR Scanning)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.0.0` or higher
- **Supabase Account**: A project with PostgreSQL and Auth enabled.

### 2. Environment Setup
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-role-key
```
*(See `.env.example` for details)*

### 3. Installation & Run
```bash
# Clone the repository
git clone https://github.com/Steventanardi/MoneyPlanner.git

# Enter the directory
cd MoneyPlanner

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🗺️ Roadmap

- [ ] **AI-Powered OCR**: Smart receipt scanning and automatic category detection.
- [ ] **Budget Forecasting**: Predictive analysis based on spending history.
- [ ] **Investment Tracker**: Integrate stock and crypto portfolio monitoring.
- [ ] **Multi-user Wallets**: Share specific wallets with family members or friends.

---

## 👤 Author

**Steven Tanardi**
*Computer Science Student*
**National Quemoy University (國立金門大學)**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Steventanardi)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/steventanardi/)

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Developed with ❤️ by Steven Tanardi
</p>

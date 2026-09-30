# Wasla Admin Panel

A modern, full-featured admin dashboard for the **Wasla** B2B e-commerce platform.  
Built with **React 19 + TypeScript + Vite**, it provides comprehensive tools for managing buyers, suppliers, orders, categories, and banners — with full **RTL (Arabic)** and **LTR (English)** internationalization support.

## 🚀 Tech Stack

### Core

- ⚛️ **Framework** — [React 19](https://react.dev/) + [TypeScript 6](https://www.typescriptlang.org/)
- ⚡ **Build Tool** — [Vite 8](https://vitejs.dev/)

### UI & Styling

- 🎨 **CSS** — [Tailwind CSS v4](https://tailwindcss.com/)
- 🧱 **Component Library** — [MUI v9](https://mui.com/) (Material UI)
- 🔁 **RTL Support** — `stylis-plugin-rtl`
- 🖼️ **Icons** — [Lucide React](https://lucide.dev/) + [Heroicons](https://heroicons.com/)

### State & Data

- 🗃️ **Global State** — [Redux Toolkit](https://redux-toolkit.js.org/) + [Redux Persist](https://github.com/rt2zz/redux-persist)
- 🔄 **Server State / Caching** — [TanStack Query v5](https://tanstack.com/query/latest)
- 🌐 **HTTP Client** — [Axios](https://axios-http.com/)

### Routing & Forms

- 🧭 **Routing** — [React Router v7](https://reactrouter.com/)
- 📝 **Forms** — [Formik](https://formik.org/)
- ✅ **Validation** — [Yup](https://github.com/jquense/yup)

### Internationalization

- 🌍 **i18n** — [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/)
- 🔍 **Language Detection** — `i18next-browser-languagedetector`

### Charts & Utilities

- 📊 **Charts** — [ApexCharts](https://apexcharts.com/) via `react-apexcharts`
- 📅 **Dates** — [date-fns](https://date-fns.org/) + [Day.js](https://day.js.org/)
- 🔔 **Notifications** — [React Hot Toast](https://react-hot-toast.com/)

## ⚙️ Environment Configuration

The app uses Vite's mode-based `.env` files:

| File               | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `.env.development` | Local development — points to `localhost:8080` |
| `.env.staging`     | Staging environment                            |
| `.env.production`  | Production environment                         |

### Required Environment Variable

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1/admin
```

## 🛠️ Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd admin

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

The dev server starts on **http://localhost:5175** by default.

### Building for Production

```bash
npm run build
```

Output is placed in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

# HireWire — Job Application Tracker

A production-ready job application tracking dashboard with Google Sheets sync, offline support, and a polished UI.

![HireWire Dashboard](https://argohaw.github.io/hirewirev2/)

## Features

- **Pipeline Management** — Track jobs through stages: Applied → Interviewing → Offered → Rejected
- **Google Sheets Sync** — Data persists in a Google Sheet with live sync
- **Offline Mode** — LocalStorage cache ensures the app works without internet
- **Smart Filtering** — Search by company, role, location, or notes; filter by status and date range
- **Sorting** — Sort by company, role, applied date, status, or salary
- **Dual Themes** — Dark and light modes with smooth transitions
- **Responsive Design** — Works on desktop and mobile
- **Dual Views** — Table and card grid layouts for job listings

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion, OGL |
| Icons | Lucide React |
| Data Sync | Google Apps Script + Sheets |

## Getting Started

### Prerequisites

- Node.js 18+
- Google account (for Sheets integration)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/hirewire.git
cd hirewire

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 to view the app.

### Building for Production

```bash
npm run build
```

Output is in the `dist/` folder.

### Linting

```bash
npm run lint
```

## Google Sheets Integration

### 1. Create a Google Sheet

1. Create a new Google Sheet
2. Rename the first sheet to `Applications`
3. Add these column headers in row 1:

| Column | Description |
|--------|-------------|
| id | Unique identifier |
| company | Company name |
| role | Job title |
| location | Job location |
| status | applied, interviewing, offered, rejected |
| appliedDate | Date applied (YYYY-MM-DD) |
| salaryMin | Minimum salary (number) |
| salaryMax | Maximum salary (number) |
| salaryCurrency | Currency code (USD, EUR, etc.) |
| jobUrl | Link to job posting |
| recruiterName | Recruiter's name |
| recruiterEmail | Recruiter's email |
| interviewDate | Interview date/time |
| notes | Notes about the application |
| jobDescription | Job description |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

### 2. Deploy the Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Open `apps-script/Code.gs` from this repo
3. Copy the code into the Apps Script editor
4. Save and deploy:
   - **Deploy → New deployment**
   - Select **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
5. Copy the deployment URL

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
VITE_SHEETS_ENDPOINT=https://script.google.com/macros/s/YOUR-DEPLOYMENT-ID/exec
VITE_SHEETS_API_KEY=your-secret-key
```

### 4. Set the API Key in Apps Script

1. In Apps Script, go to **Project Settings** (gear icon)
2. Under **Script Properties**, add:
   - Property: `API_KEY`
   - Value: `your-secret-key` (matching your `.env`)

> **Important:** Restart the dev server after changing `.env` — Vite reads env vars at startup.

## Deployment

### GitHub Pages

The project includes a CI/CD workflow that automatically deploys to GitHub Pages on push to `main`.

1. Fork or push this repo to GitHub
2. Go to **Settings → Pages**
3. Under "Build and deployment", select **GitHub Actions** as the source
4. The workflow (`.github/workflows/ci-cd.yml`) will automatically deploy on push to `main`

### Manual Deployment

```bash
npm run build
# Upload the contents of dist/ to your hosting provider
```

## Project Structure

```
hirewire/
├── .github/workflows/   # CI/CD pipeline
├── apps-script/         # Google Apps Script backend
├── public/              # Static assets (logo, favicon)
├── src/
│   ├── components/      # React components
│   │   ├── common/      # Shared components (Header, Footer, etc.)
│   │   ├── dashboard/   # Dashboard components (JobTable, JobCardGrid)
│   │   ├── modals/      # Modal dialogs
│   │   └── react-bits/  # Animation components
│   ├── context/         # React Context providers
│   ├── data/            # Seed data
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── services/        # API services (sheetsApi.ts)
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── .env.example         # Environment variable template
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run the linter |
| `npm run preview` | Preview production build |

## License

MIT License — feel free to use this for your own job search tracking!
# SkillBridge AI – Resume Analyzer and Interview Coach

SkillBridge AI is a professional, production-style full-stack SaaS platform built with the Next.js App Router, TypeScript, Tailwind CSS, and Prisma ORM on a MySQL database, powered by the Gemini AI API. It helps candidates optimize their resumes for Applicant Tracking Systems (ATS), match targeted job descriptions, draft custom cover letters, and prepare for interviews with an interactive coach.

## Key Features

1. **AI Resume Analyzer**: Parses PDF resumes, returns an ATS score (0-100), summarizes profile contents, extracts key strengths/weaknesses, lists suggestions, and provides a final improvement checklist.
2. **Job Description Matcher**: Compares your resume to any pasted job description, calculating match percentages, listing matching vs. missing skills, identifying experience gaps, and offering resume enhancement tips.
3. **AI Cover Letter Generator**: Generates professional, company-tailored cover letters based on your resume and job description, with an editable layout and copy-to-clipboard functionality.
4. **Interactive Interview Coach**: Dynamically builds HR, technical, and project-based interview prep sets tailored to your resume, role, and difficulty level (Beginner, Intermediate, Advanced) with toggleable sample answers.
5. **Platform History**: Logs user session actions and stores all past analyses, letters, and coaching questions with dates, search filtering, and single-item deletion.
6. **Dark/Light SaaS UI**: A portfolio-ready interface with responsive sidebar layouts, glassmorphism components, hover micro-animations, and client-side theme controls.

---

## Tech Stack

*   **Frontend**: Next.js App Router, React 19, TypeScript, Tailwind CSS (v4), Lucide Icons
*   **Backend**: Next.js API Route Handlers (REST Architecture)
*   **Authentication**: JWT Session Cookies, Bcryptjs Password Hashing
*   **Database**: MySQL with Prisma ORM (v7)
*   **AI Integration**: `@google/generative-ai` (Gemini 1.5 Flash) with fallback mock engines
*   **Utilities**: `pdf-parse` for text extraction

---

## Folder Structure

```text
├── prisma/
│   ├── schema.prisma        # Prisma Database Models
│   └── migrations/          # SQL Database Migrations
├── src/
│   ├── app/
│   │   ├── (auth)/          # Authenticated Layout Group (Login / Register)
│   │   ├── api/             # API Route Handlers (Auth, Resumes, AI, History)
│   │   ├── dashboard/       # Protect Dashboard Layout & Subpages
│   │   ├── globals.css      # CSS styling (Tailwind v4 theme variables)
│   │   ├── layout.tsx       # Root layout configuration & SEO tags
│   │   └── page.tsx         # SaaS Landing Page
│   ├── lib/
│   │   ├── auth.ts          # Session helper utilities & JWT sign/verify
│   │   ├── db.ts            # Prisma client instance with MariaDB driver adapter
│   │   └── gemini.ts        # Gemini AI prompt helpers & mock fallbacks
│   └── generated/
│       └── prisma/          # Auto-generated Prisma client classes
├── .env.example             # Configuration environment variable template
├── prisma.config.ts         # Prisma v7 connection settings
├── next.config.ts           # Next.js configurations (excludes pdf-parse)
└── tsconfig.json            # TypeScript path configurations
```

---

## Environment Variables

Create a `.env` file in the root directory and configure the variables:

```env
# Database Connection URL (MySQL)
DATABASE_URL="mysql://username:password@localhost:3306/skillbridge_db"

# JWT Authentication secret
JWT_SECRET="your-jwt-session-secret-key"

# Gemini AI Studio Key (Retrieve from Google AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# OpenAI Key (Optional fallback)
OPENAI_API_KEY="your-openai-api-key"
```

---

## Installation and Setup

### 1. Install Dependencies
Run from the root directory:
```bash
npm install
```

### 2. Configure Database
Ensure your MySQL server is running and the database specified in your `DATABASE_URL` is created.

Apply migrations to initialize the database tables:
```bash
npx prisma migrate dev --name init
```

### 3. Generate Client
Re-generate the client typing maps:
```bash
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Routes

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User signup & sets auth cookie | No |
| `POST` | `/api/auth/login` | User signin & sets auth cookie | No |
| `POST` | `/api/auth/logout` | User signout & deletes cookie | Yes |
| `GET` | `/api/auth/me` | Fetch logged-in user profile status | Yes |
| `POST` | `/api/resumes/upload` | Parse PDF and extract plain text | Yes |
| `GET` | `/api/resumes` | Retrieve list of user's resumes | Yes |
| `POST` | `/api/analysis/resume` | Scan resume for ATS score & checklist | Yes |
| `POST` | `/api/analysis/job-match` | Compare resume with pasted job scope | Yes |
| `POST` | `/api/interview/generate` | Generate targeted coach interview sets | Yes |
| `POST` | `/api/cover-letter/generate` | Draft custom targeted cover letters | Yes |
| `GET` | `/api/history` | Retrieve user history checklists | Yes |
| `DELETE` | `/api/history/:id` | Delete history item (`?type=...`) | Yes |

---

## Deployment Notes

### Vercel Deployment
To deploy this project to Vercel:
1. Ensure your codebase is pushed to a remote GitHub repository.
2. Link your Vercel account to GitHub and import the project.
3. Configure your Environment Variables in the Vercel Project Settings (copy settings from your local `.env` file).
4. Run the Prisma database migrations or build command:
   ```bash
   npx prisma generate
   ```
5. Click deploy.

> [!WARNING]
> Ensure that your MySQL database server (e.g. Aiven, PlanetScale, AWS RDS, or self-hosted) is publicly accessible by Vercel's deployment servers, and that the connection URL (`DATABASE_URL`) is correctly configured in Vercel settings.

---

## Security Warning

> [!IMPORTANT]
> **DO NOT** commit the `.env` file containing database passwords, API credentials, or JWT secrets to your git repository. Verify that `.gitignore` contains `.env` and `.env.*` rules before executing any pushes.

---

## Screenshots & Interface Placeholder

![SkillBridge AI Interface Mockup](https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1000&auto=format&fit=crop)

---

## Future Improvements

*   **PDF Downloader**: PDF download is fully optimized using server-side Puppeteer engines.
*   **Resume Builder Templates**: Added 10 interactive free and premium templates (Classic Clean, Modern Blue, Minimal ATS, Executive Pro, Creative Sidebar, Developer Dark, Corporate Elite, Elegant Serif, Tech Gradient, Compact One Page) with lock badges.
*   **Payments Integration**: Full integration of Razorpay payments checkout (INR ₹199) with webhook verification.
*   **Resume Editor**: Add a side-by-side rich text editor to rewrite resumes inline while receiving live score updates.
*   **Audio Prep**: Support speech-to-text recording during interview prep.


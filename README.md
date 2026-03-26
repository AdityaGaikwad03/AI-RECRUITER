# HireSmart — Smart Recruitment Platform

> **Internship Assignment:** Smart Recruitment Experience
> **Demo Login:** hire-me@anshumat.org / HireMe@2025!

## 🎯 What This Solves
Traditional resume uploads are broken — parsing errors, formatting bias, inconsistent data. HireSmart replaces PDF uploads with a guided, conversational profile builder with smart fallback mode.

## 🚀 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + React Router |
| Styling | CSS Modules (custom dark design system) |
| Backend | Node.js + Express |
| Database | JSON file store (zero native dependencies) |
| AI Capabilities | Optional external assistant API (with local smart fallback) |
| Auth | JWT + bcrypt |

## 📁 Structure
```
/frontend   → React app (Vite)
/backend    → Express API + JSON database
README.md   → This file
```

## ⚡ Setup

### 1. Backend
```bash
cd backend
npm install
# Optional: add your Anthropic API key for real AI
cp .env.example .env
# Edit .env: ANTHROPIC_API_KEY=sk-ant-...
node server.js
# Runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Candidate** | hire-me@anshumat.org | HireMe@2025! |
| **Recruiter** | recruiter@demo.com | Recruiter@2025! |

## 🧠 AI Features

### Without API Key (works immediately)
- Smart mock responses for all AI features
- Pre-built skill suggestion database
- Pattern-based experience parsing
- Template summary generation

### With Anthropic API Key
- Real conversational AI profile building
- Natural language → structured experience extraction
- Context-aware skill suggestions
- Personalized professional summaries

## 📌 All Required Screens

| Screen | Route | User |
|---|---|---|
| Landing Page | / | Public |
| Sign Up | /signup | Public |
| Sign In | /login | Public |
| Onboarding | /onboarding | Candidate |
| AI Profile Builder | /builder | Candidate |
| Profile Preview | /preview | Candidate |
| Recruiter Dashboard | /recruiter | Recruiter |
| Candidate Detail | /recruiter/candidate/:id | Recruiter |

## 🎨 Design Decisions
- **Dark theme** with blue/green accent palette — professional yet distinctive
- **Sora + DM Sans** — modern, readable display pairing
- **Sticky AI chat panel** on every builder section — AI is always accessible
- **Card-based profiles** replacing traditional resume format
- **Completion ring** shows profile strength visually

## 🤖 AI Interaction Design

The AI assistant is always present in the profile builder as a side panel chat. It:
1. **Parses natural language** → "I worked at Amazon for 2 years as backend engineer" → structured entry
2. **Suggests relevant skills** based on target role and existing profile
3. **Generates professional summaries** from profile data
4. **Recommends target roles** with match percentage and reasoning
5. **Answers follow-up questions** conversationally

## 📊 Information Architecture

```
Candidate Profile
├── Basic Info (name, headline, location, availability, target roles)
├── Skills (name, level, endorsements)
├── Experience (role, company, duration, description, achievements, skills)
├── Projects (name, description, tech stack, link)
├── Education (degree, institute, year, grade)
└── Summary (AI-generated or custom)
```

## 💾 Save / Sync
- Auto-saves every 2 seconds as user types
- Manual save button with confirmation
- Profile completion percentage tracked in real-time
- Data persists across sessions via JSON file store

## 📤 Export / Share
- **Share profile link** — copies URL to clipboard
- **Export PDF** — triggers browser print dialog (formatted for print)

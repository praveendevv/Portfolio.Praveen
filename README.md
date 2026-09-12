# Praveen Vishnoi — Personal Portfolio Website

A modern, responsive personal developer portfolio website designed for **Praveen Vishnoi** (B.Tech student at JECRC University, Jaipur | AI & Technology Enthusiast), engineered with **React, Vite, and Tailwind CSS**.

Built for zero-friction deployment on **Vercel**, with clean frontend architecture and zero backend dependencies.

---

## ✨ Features & Structure

1. **Hero / Home**:
   - Monogram logo `PV`
   - Headline: "Hi, I'm Praveen Vishnoi"
   - Tagline: "B.Tech Student | AI & Technology Enthusiast"
   - Direct smooth-scrolling call-to-actions: `View Projects` and `Contact Me`
   - Badges for JECRC University, Jaipur, and quick contact channels

2. **About Me**:
   - Professional student narrative focusing on modern web development, Artificial Intelligence, Generative AI, and digital productivity
   - Emphasis on learning through practical projects
   - Interactive feature cards and quick-facts summary

3. **Education**:
   - Detailed timeline card for B.Tech at JECRC University (Current Year / In Progress)
   - Core learning areas: Web Development, AI/Machine Learning, Programming Fundamentals, Digital Tools
   - Institutional highlights

4. **Skills**:
   - Attractive skill cards with icons and category tags:
     - HTML
     - CSS
     - JavaScript
     - Python
     - Artificial Intelligence
     - Generative AI
     - Web Development
     - Digital Productivity
   - Interactive category filter tabs (All, Frontend Core, Programming, Emerging Tech, Engineering, Workflow & Tools)

5. **Projects**:
   - Featured projects:
     1. **Personal Portfolio Website** (React, Vite, Tailwind CSS)
     2. **AI Website Project** (AI, Generative AI, React, Tailwind CSS)
     3. **Student Productivity Project** (JavaScript, Productivity System, CSS3)
   - Tech stack tags, "View Project" interactive preview modal, and GitHub repository links

6. **Achievements**:
   - Modular, pre-configured structure for:
     - Certifications
     - Hackathons & Competitions
     - Courses & Bootcamps
     - Awards & Honors
     - Other Achievements
   - Empty-state templates ready for you to add items directly in `src/data/portfolioData.js` without modifying any UI code

7. **Contact**:
   - Direct clickable channels:
     - Email: `praveenvishnoi39@gmail.com` (with 1-click clipboard copy)
     - LinkedIn: Praveen Vishnoi
     - GitHub: praveen.devv
     - Location: Jaipur, India • JECRC University
   - Interactive message form that drafts direct email inquiries

8. **Design & Ergonomics**:
   - Sticky glassmorphic navbar with active section scroll-spy
   - Fully responsive mobile drawer with hamburger toggle
   - Dark-slate modern aesthetic with subtle glowing accents and micro-interactions
   - Accessible, fast-loading, zero console errors

---

## 🚀 Getting Started Locally

### 1. Requirements
- Node.js (v18 or higher) — *already configured in your environment at `C:\Users\PRAVEEN\nodejs`*

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```
Creates an optimized, minified bundle in the `dist/` directory.

---

## 🌐 Deploy to Vercel (Free & Instant)

Deploying this portfolio on Vercel is seamless:

### Method A: Via Vercel Web Dashboard (Recommended)
1. Push this folder to a GitHub repository (e.g., `github.com/praveen-devv/portfolio`).
2. Visit [vercel.com](https://vercel.com) and log in with your GitHub account.
3. Click **"Add New Project"** and import your portfolio repository.
4. Framework Preset will automatically detect **Vite**.
5. Click **"Deploy"**. Your website will be live with a free `.vercel.app` URL and automatic HTTPS!

### Method B: Via Vercel CLI
```bash
npx vercel
```

---

## 🛠️ Customizing Your Content

All text, links, projects, and achievements are centralized in a single file:
👉 `src/data/portfolioData.js`

- **To update social profile links**: Edit `personalInfo.linkedin.url` and `personalInfo.github.url`.
- **To add a project**: Edit or append to `projectsData`.
- **To add an achievement**: In `achievementCategories`, locate the relevant category (e.g. `certifications`) and add your item to its `items` array:
  ```javascript
  {
    title: "Google AI Essentials",
    issuer: "Coursera",
    date: "2026",
    link: "https://coursera.org/..."
  }
  ```

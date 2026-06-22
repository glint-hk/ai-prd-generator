# AI PRD Generator — Complete Guide

> **Who this guide is for:** Someone who has never written a single line of code and wants to understand, run, customize, and deploy this project completely on their own. Every step is explained from first principles. Nothing is assumed.

---

## Table of Contents

1. [What This Project Does](#1-what-this-project-does)
2. [How It Works — Plain English](#2-how-it-works--plain-english)
3. [The Mental Model — Key Concepts](#3-the-mental-model--key-concepts)
4. [Prerequisites — Software You Need](#4-prerequisites--software-you-need)
5. [Getting Your Gemini API Key](#5-getting-your-gemini-api-key)
6. [Downloading the Project](#6-downloading-the-project)
7. [Setting Up the Project Locally](#7-setting-up-the-project-locally)
8. [Running the App on Your Computer](#8-running-the-app-on-your-computer)
9. [What Every File Does](#9-what-every-file-does)
10. [How the Code Actually Works](#10-how-the-code-actually-works)
11. [Deploying to the Internet (Vercel)](#11-deploying-to-the-internet-vercel)
12. [How to Customize This App](#12-how-to-customize-this-app)
13. [Troubleshooting — When Things Go Wrong](#13-troubleshooting--when-things-go-wrong)
14. [Glossary — Every Term Explained](#14-glossary--every-term-explained)

---

## 1. What This Project Does

This is a web application — a website with interactive features — that does one thing:

**You type a product idea in plain English. The app uses AI to generate a complete Product Requirements Document (PRD) in seconds.**

A PRD is the document a Product Manager writes before any software gets built. It answers: What are we building? For whom? Why? What does success look like? What are we NOT building?

For example, if you type:
> "A tool that helps freelancers send branded invoices and track payment status"

The app returns a full structured document with:
- A product name and one-liner description
- The problem being solved
- Who the target user is and their pain points
- A prioritized feature list (P0/P1/P2)
- Success metrics with targets
- What is explicitly out of scope
- Open questions that need answering
- A recommended tech stack
- A goal for the first 2-week sprint

This is built as a portfolio piece for a Fractional PM consulting practice — it demonstrates exactly what a PM deliverable looks like.

---

## 2. How It Works — Plain English

Here is exactly what happens when someone uses this app, step by step:

**Step 1 — You open the website in a browser.**
The browser downloads the HTML, CSS, and JavaScript files that make up the visual interface. These files were built by Vite (a tool that bundles your code) and are hosted on Vercel (a hosting platform).

**Step 2 — You type your product idea and click "Generate PRD".**
The JavaScript running in your browser collects your text and sends it to a URL: `/api/generate-prd`. This is not a page — it is an API endpoint, a special address that accepts data and returns data.

**Step 3 — The API route receives your idea.**
The file `api/generate-prd.js` runs on Vercel's servers (not in your browser). It validates that your input is at least 10 characters long. It then picks up your secret API key from the server's environment (your browser never sees this key).

**Step 4 — The API route calls Gemini.**
It sends a request to Google's servers at `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`. It passes your product idea plus a very specific system prompt (a set of instructions) that tells Gemini to return a structured JSON document.

**Step 5 — Gemini responds.**
Google's servers process the request using the Gemini 2.0 Flash model and return a JSON object — a structured block of data with all the PRD sections filled in.

**Step 6 — The API route sends this back to your browser.**
The `generate-prd.js` function parses the JSON and returns it to your browser.

**Step 7 — Your browser renders the PRD.**
The React components (the visual building blocks of the UI) receive the JSON data and display it on screen — each section in its own styled card with a staggered fade-in animation.

**Step 8 — You copy it or start over.**
The "Copy PRD as Text" button formats everything into plain text and puts it on your clipboard. "Start Over" clears everything.

---

## 3. The Mental Model — Key Concepts

Before touching any code, understand these five concepts. Everything else will make sense after this.

### What is a Terminal?

A Terminal (also called Command Line, Shell, or Console) is a text-based way to control your computer. Instead of clicking icons, you type commands and press Enter.

On Mac: Press `Command + Space`, type "Terminal", press Enter.
On Windows: Press the Windows key, type "PowerShell", press Enter.

When this guide says "run a command", it means: open the Terminal, type that exact text, press Enter, and wait until the cursor reappears.

### What is Node.js?

When JavaScript was invented, it only ran inside web browsers — it could make websites interactive but couldn't do anything else. Node.js is a program that lets JavaScript run outside the browser, directly on your computer or on a server. The `api/generate-prd.js` file runs on Node.js.

### What is npm?

npm stands for Node Package Manager. When you install Node.js, you get npm automatically. npm is a tool that downloads pre-written code that other developers have published. Instead of writing every feature from scratch, you can download someone else's code as a "package". Running `npm install` reads the `package.json` file and downloads all the packages this project needs.

### What is an API?

API stands for Application Programming Interface. Think of it like a restaurant menu. You (the customer) don't go into the kitchen — you look at the menu (the API documentation), choose what you want (make a request), and the kitchen (the server) prepares and returns your order (the response). Google published Gemini as an API — you send them your text and a key, they return the AI's response.

### What is JSON?

JSON stands for JavaScript Object Notation. It is a way to structure data as text so that computers can easily read it. It looks like this:

```json
{
  "productName": "InvoicePro",
  "oneLiner": "Branded invoicing for freelancers",
  "features": ["Invoice creation", "Payment tracking", "Reminders"]
}
```

The keys (words in quotes on the left) are like column headers. The values (on the right) are the actual data. Arrays (lists) use square brackets `[]`. The AI returns a JSON object, and the frontend renders it as a visual document.

---

## 4. Prerequisites — Software You Need

You need three things installed on your computer before you can run this project. Here is exactly how to install each one.

### 4.1 — Node.js (version 18 or higher)

Node.js lets you run JavaScript outside the browser, which is required to run this project locally.

**Check if you already have it:**
Open your Terminal and type:
```
node --version
```
If it prints something like `v18.17.0` or higher, you're done — skip to 4.2.
If it says "command not found" or shows a version below 18, install it:

**Install Node.js:**
1. Go to [nodejs.org](https://nodejs.org)
2. Click the button that says **"LTS"** (Long-Term Support — the stable version)
3. Download the installer for your operating system (Mac or Windows)
4. Open the downloaded file and follow the installation wizard — click Next/Continue on every screen
5. When done, close and reopen your Terminal, then run `node --version` again to confirm it worked

### 4.2 — Git

Git is a version control tool — it tracks changes to files and lets you download code from GitHub. 

**Check if you already have it:**
```
git --version
```
If it prints a version number, you're done — skip to 4.3.

**Install Git:**

On Mac: Run this command. A popup may appear asking you to install "developer tools" — click Install and wait.
```
xcode-select --install
```

On Windows: Go to [git-scm.com/download/win](https://git-scm.com/download/win), download the installer, and run it. Accept all defaults.

After installing, close and reopen your Terminal, then run `git --version` to confirm.

### 4.3 — Vercel CLI

Vercel CLI is a command-line tool that lets you run your project locally exactly as it would run on Vercel's servers (including the API functions), and lets you deploy it with one command.

Once Node.js is installed, run this in your Terminal:
```
npm install -g vercel
```

The `-g` means "global" — this installs Vercel as a command you can use from anywhere, not just in one project folder.

Confirm it worked:
```
vercel --version
```
It should print a version number like `33.x.x`.

---

## 5. Getting Your Gemini API Key

The AI brain of this app is Gemini, made by Google. To use it, you need an API key — a unique secret password that identifies you when you call Google's servers.

**Free tier available.** Google offers a generous free tier for Gemini API — enough for hundreds of PRD generations. Paid usage is charged per token (roughly per word processed).

Here is exactly how to get a key:

**Step 1:** Go to [aistudio.google.com](https://aistudio.google.com)

**Step 2:** Sign in with your Google account (Gmail works). No new account needed.

**Step 3:** Once logged in, click **"Get API Key"** in the left sidebar.

**Step 4:** Click **"Create API key"**, then select "Create API key in new project" (or an existing project if you have one).

**Step 5:** Your key will be generated and displayed immediately. It will be a long string of characters. Copy it now.

**CRITICAL:** Save this key somewhere safe (like a password manager or a notes app). You can always retrieve it again from Google AI Studio, but treat it as a password.

**Step 6 (optional):** If you expect heavy usage, set up a billing account at [console.cloud.google.com](https://console.cloud.google.com) — but the free tier is sufficient for personal/portfolio use.

**Keep your API key secret.** Anyone who has it can use your Google AI credits. Never paste it into a chat, email, or public file. This project is designed so the key lives only on the server — never in your browser.

---

## 6. Downloading the Project

If you received this project as a ZIP file:
1. Unzip/extract it to a folder on your computer
2. Open your Terminal
3. Navigate to that folder (see the `cd` command explanation below)

If the project is on GitHub:
1. Open your Terminal
2. Navigate to where you want to store the project, e.g.:
   ```
   cd ~/Documents
   ```
   (`cd` means "change directory" — it moves you into a folder)
3. Download the project:
   ```
   git clone https://github.com/YOUR_USERNAME/ai-prd-generator.git
   ```
   Replace `YOUR_USERNAME` with the actual GitHub username.
4. Move into the project folder:
   ```
   cd ai-prd-generator
   ```

**How to navigate with `cd`:**
- `cd folder-name` — move into a folder
- `cd ..` — go back up one level
- `cd ~` — go to your home folder (Mac: `/Users/yourname`, Windows: `C:\Users\yourname`)
- `pwd` — print your current location (stands for "print working directory")

After this step, every Terminal command in this guide assumes you are inside the `ai-prd-generator` folder.

---

## 7. Setting Up the Project Locally

### Step 1 — Install dependencies

Run:
```
npm install
```

This reads the `package.json` file, goes to the npm registry (a giant online library of code), and downloads every package the project needs into a folder called `node_modules`. This folder will be large (100+ MB) — that is normal. It may take 30–60 seconds.

When it's done, you'll see output like:
```
added 130 packages, and audited 131 packages in 9s
```

Do not worry about the "vulnerabilities" warning — these are in development tools, not in the deployed code that users interact with.

### Step 2 — Create your environment file

"Environment variables" are settings that vary between environments — your local machine vs. the production server. The API key is the main one. You store it in a file called `.env.local` that lives only on your computer and is never uploaded to GitHub.

The project includes a template file called `.env.local.example`. You need to copy it:

**On Mac/Linux:**
```
cp .env.local.example .env.local
```

**On Windows (PowerShell):**
```
copy .env.local.example .env.local
```

Now open the `.env.local` file in a text editor. The file will contain:
```
GEMINI_API_KEY=your_key_here
```

Replace `your_key_here` with the API key you copied from Google AI Studio.

Save the file. Do not add spaces, quotes, or anything else around the key.

### Step 3 — Log in to Vercel

Run:
```
vercel login
```

It will ask for your email address. Type it in and press Enter. Vercel will send you an email with a verification link. Click that link. Go back to the Terminal — you should see "Logged in!"

If you don't have a Vercel account yet, go to [vercel.com](https://vercel.com) and sign up first (it's free). You can sign up with GitHub, GitLab, or email.

### Step 4 — Link the project to Vercel (first time only)

Run:
```
vercel
```

Vercel will ask you a series of questions. Here is how to answer them:

```
? Set up and deploy "~/path/to/ai-prd-generator"? [Y/n]
→ Press Enter (accepts Yes)

? Which scope do you want to deploy to?
→ Select your personal account (the one with your name)

? Link to existing project? [y/N]
→ Press Enter (accepts No — we're creating a new project)

? What's your project's name?
→ Type: ai-prd-generator (or press Enter to accept the default)

? In which directory is your code located?
→ Press Enter (accepts ./ which means the current folder)
```

It may ask if you want to override settings — press Enter to accept defaults. This connects your local folder to a Vercel project. A `.vercel` folder is created (it's in `.gitignore` so it won't be committed to Git).

After this, a test deployment goes live on a URL like `https://ai-prd-generator-abc123.vercel.app` — this is just a preview, not the final deployment.

---

## 8. Running the App on Your Computer

Now you're ready to run the app locally. Run:
```
vercel dev
```

You will see output like:
```
Vercel CLI 33.x.x
> Ready! Available at http://localhost:3000
```

Open your web browser and go to:
```
http://localhost:3000
```

You should see the full AI PRD Generator interface.

**Try it:** Type a product idea (at least 10 characters) and click "Generate PRD". After a few seconds, a complete PRD should appear on the right side.

**To stop the server:** Go back to the Terminal and press `Control + C`. This kills the server. The website will stop working until you run `vercel dev` again.

**Why use `vercel dev` instead of `npm run dev`?**
`npm run dev` starts the Vite development server, which only handles the frontend (the visual part). It has no idea how to run the `api/generate-prd.js` serverless function. When you click "Generate PRD", you'd get a 404 error. `vercel dev` runs both the frontend and the API functions together on the same port, exactly mirroring how it works in production.

---

## 9. What Every File Does

Here is every file in the project explained in plain English.

```
ai-prd-generator/
├── api/
│   └── generate-prd.js
├── src/
│   ├── components/
│   │   ├── ExamplePrompts.jsx
│   │   ├── LoadingPulse.jsx
│   │   ├── PRDOutput.jsx
│   │   └── SectionCard.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── package-lock.json
├── .env.local           ← you create this; never commit it
├── .env.local.example
├── .gitignore
└── README.md
```

---

### `package.json`

The project's "identity card" and instruction manual for npm. It contains:

- **`name`** — the project's name
- **`scripts`** — shorthand commands. When you type `npm run build`, npm looks here and runs `vite build`
- **`dependencies`** — packages needed for the app to work when users use it (React, Lucide icons)
- **`devDependencies`** — packages only needed during development and building (Vite, Tailwind, PostCSS)

When you run `npm install`, npm reads this file and downloads everything listed.

---

### `package-lock.json`

Automatically generated by npm. It records the exact version of every package (and every package that those packages depend on) that was installed. You should never edit this file manually. It exists so that if someone else downloads the project, they get the exact same versions of everything — preventing "it works on my machine" problems.

---

### `vite.config.js`

Configuration for Vite, the build tool. Vite:
1. During development: serves your files quickly with instant updates when you change code
2. For production: bundles all your JavaScript, CSS, and assets into optimized files in the `dist/` folder

This config file does three things:
- Loads the React plugin (so Vite understands JSX — the HTML-like syntax in React files)
- Sets `base: '/'` so all URLs are relative to the root (important for Vercel deployment)

---

### `tailwind.config.js`

Configuration for Tailwind CSS. It tells Tailwind which files to scan for CSS class names. Tailwind only includes CSS for the classes you actually use — scanning the `content` list is how it knows what to include. The `fontFamily` setting makes Inter the default font throughout the app.

---

### `postcss.config.js`

PostCSS is a tool that processes CSS. This config tells PostCSS to run two plugins:
1. **tailwindcss** — generates the Tailwind utility classes
2. **autoprefixer** — automatically adds browser-specific CSS prefixes (like `-webkit-`) for compatibility

You rarely need to touch this file.

---

### `index.html`

The single HTML file that the browser loads first. In a React app, this file is intentionally minimal — it just provides the "shell". It contains:

- Meta tags (page title, description, social media preview info)
- The Google Fonts link that loads the Inter typeface
- A `<div id="root"></div>` — this is the single empty box where React will inject the entire application
- A `<script>` tag pointing to `src/main.jsx` — the JavaScript entry point

React takes over this empty `#root` div and builds everything inside it dynamically.

---

### `src/main.jsx`

The JavaScript entry point — the very first file that runs. It does exactly one thing: finds the `<div id="root">` in `index.html` and tells React to render the `<App />` component inside it. `StrictMode` is a React development helper that warns you about potential issues.

---

### `src/index.css`

The global stylesheet. It contains:
- `@tailwind base` — resets browser default styles (every browser has slightly different defaults; this makes everything consistent)
- `@tailwind components` — allows you to define reusable CSS classes (not used here)
- `@tailwind utilities` — loads all the Tailwind utility classes like `bg-zinc-900`, `text-sm`, `rounded-xl`
- Custom `@keyframes` animations:
  - `fadeInUp` — the subtle upward fade when PRD sections appear
  - `skeletonPulse` — the breathing pulse on the loading skeleton
- Custom CSS classes that use these animations: `.animate-fade-in`, `.animate-skeleton`
- Scrollbar styling for a clean dark look

---

### `src/App.jsx`

The root component of the entire application — the top-level container that holds everything. This is where the overall layout lives and where the main application state is managed.

**State (the data that can change):**
- `productIdea` — the text currently in the textarea
- `prd` — the generated PRD data (null until generated)
- `loading` — true while waiting for the API, false otherwise
- `error` — error message if something went wrong, null otherwise

**Functions:**
- `generatePRD(idea?)` — sends the idea to `/api/generate-prd`, updates state with the result
- `handleExampleSelect(example)` — sets the textarea to the example text, immediately calls `generatePRD`
- `handleReset()` — clears everything back to the initial empty state
- `handleKeyDown` — listens for ⌘+Enter or Ctrl+Enter to trigger generation

**Layout:**
Two columns on desktop (the left input panel is sticky, so it stays visible as you scroll the PRD), one column on mobile (stacked vertically).

---

### `src/components/ExamplePrompts.jsx`

A simple component that renders four clickable pill buttons. Each pill shows a shortened preview of an example prompt. When clicked, it calls the `onSelect` callback with the full example text, which triggers generation immediately. The `disabled` prop prevents clicking while a generation is in progress.

---

### `src/components/LoadingPulse.jsx`

The skeleton loading state shown while the API call is in progress. It renders a series of placeholder "cards" that match the approximate shape of the real PRD output. Each card contains grey bars where text will eventually appear. The `animate-skeleton` class makes them slowly pulse between 100% and 35% opacity, giving the impression that the content is "loading in". This is a UX technique that reduces perceived wait time.

---

### `src/components/SectionCard.jsx`

A reusable wrapper component used by every section of the PRD output. It provides:
- Consistent dark card styling (zinc-900 background, zinc-800 border, rounded-2xl corners)
- A header row with an icon and section title in small-caps uppercase
- A subtle left border highlight in indigo that slides in when you hover over the card
- A hover shadow effect

It accepts three props: `title` (the section name), `icon` (a Lucide icon component), and `children` (whatever content goes inside the card).

---

### `src/components/PRDOutput.jsx`

The most complex component. It receives the full PRD data object as a prop and renders all nine sections of the document in order. Key details:

**Animations:** Each section is wrapped in an `AnimatedSection` component that applies the `animate-fade-in` CSS class with an incrementally larger `animation-delay`. The first section appears immediately, the second after 60ms, the third after 120ms, etc. This "staggered" effect makes the content feel like it's flowing in rather than dumping all at once.

**Priority badges:** Core features each have a P0/P1/P2 badge. P0 is red (must-have), P1 is amber (important), P2 is grey (nice-to-have). The color coding communicates importance at a glance.

**Sprint 1 Goal:** This section gets special treatment — instead of a standard SectionCard, it has an indigo-tinted background with a subtle gradient. This makes it visually stand out as the most actionable output of the entire document.

**Copy to clipboard:** The `formatPRDAsText` function converts the structured JSON data into a clean plain-text document, formatted exactly as specified. The `navigator.clipboard.writeText()` API copies it to the user's clipboard. The button temporarily shows a green checkmark to confirm the copy worked.

**Start Over:** Calls the `onReset` prop, which is the `handleReset` function in `App.jsx` — clearing all state.

---

### `api/generate-prd.js`

This is the serverless function — the server-side code that runs on Vercel's infrastructure, not in the user's browser. This is the most security-critical file.

**Why it exists separately:** The Gemini API key must never be in browser-side code. If it were in the frontend JavaScript, any user could open the browser's developer tools, find the key, and use your Google AI credits. By putting the API call in a serverless function, the key lives only on Vercel's servers.

**What it does step by step:**
1. Rejects any request that isn't a POST (returns HTTP 405)
2. Reads `productIdea` from the request body
3. Validates it exists and is at least 10 characters (returns HTTP 400 if not)
4. Checks that `GEMINI_API_KEY` is set in the environment (returns HTTP 500 if not)
5. Calls `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent` with the system prompt and user's idea, requesting JSON output via `responseMimeType: "application/json"`
6. If Gemini returns an error, logs it and returns HTTP 502
7. Extracts the text from Gemini's response (`candidates[0].content.parts[0].text`)
8. Strips any markdown code fences as a safety fallback, then parses the JSON
9. Parses the cleaned text as JSON
10. Returns the parsed JSON to the browser with HTTP 200

**The system prompt:** The long string at the top of the file. It instructs Gemini on exactly what to do, what structure to use, and what rules to follow. The quality of the output is entirely determined by the quality of this prompt.

---

### `.gitignore`

A list of files and folders that Git should completely ignore — they will never be committed to the repository or pushed to GitHub. Key entries:

- `node_modules/` — the downloaded packages folder. It's huge and can be regenerated with `npm install`. Never commit this.
- `.env` and `.env.local` — your secrets. Never commit these. If you accidentally commit an API key, revoke it immediately and generate a new one.
- `dist/` — the built output. Generated automatically during deployment.
- `.vercel/` — local Vercel configuration linking your folder to a project.

---

### `.env.local.example`

A template showing what the `.env.local` file should look like — without the actual secret value. This file IS committed to Git so that other developers know what environment variables to set up. The actual `.env.local` is in `.gitignore` so it's never committed.

---

## 10. How the Code Actually Works

This section walks through the complete data flow in plain English.

### When the page loads

1. The browser requests `https://your-site.vercel.app`
2. Vercel returns `index.html`
3. The browser sees the `<script src="/src/main.jsx">` tag and requests that file
4. Vite (during dev) or the pre-built bundle (in production) serves the JavaScript
5. `main.jsx` runs, finds `<div id="root">`, and renders `<App />` inside it
6. React builds the entire page — the textarea, button, empty state — and displays it
7. The browser also loads `index.css` which provides all the styling

### When the user types and clicks Generate

1. Every keystroke in the textarea fires the `onChange` handler in `App.jsx`, which calls `setProductIdea(e.target.value)` — updating the state
2. React re-renders the character count and changes the button's disabled state in real time
3. On click, `generatePRD()` runs: it sets `loading = true` (shows the spinner), then calls `fetch('/api/generate-prd', ...)`
4. The browser sends an HTTP POST request to `/api/generate-prd` with the body `{"productIdea": "your text here"}`
5. Vercel's edge network receives this request and routes it to the `api/generate-prd.js` function
6. The function runs on Node.js, calls Gemini, gets JSON back, and returns it
7. The browser's `fetch` call resolves — `const data = await res.json()` gives us the PRD object
8. `setPrd(data)` updates state — React re-renders, replacing LoadingPulse with PRDOutput
9. PRDOutput renders all nine sections with staggered animations

### How React's state model works

React components have "state" — data that, when changed, causes the component to re-render (redraw itself). Think of state like variables that the UI is "watching". When a state variable changes, React figures out the minimum number of DOM updates needed and applies them.

In this app:
- `productIdea` changing → re-renders the character count and button disabled state
- `loading` changing to `true` → hides EmptyState, shows LoadingPulse, disables button
- `prd` getting a value → hides LoadingPulse, shows PRDOutput
- `error` getting a value → shows the red error box

---

## 11. Deploying to the Internet (Vercel)

Deploying means taking your local code and putting it on a server that anyone with the URL can access.

### Step 1 — Push your code to GitHub (recommended)

If you haven't already, create a GitHub repository:
1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** in the top right → "New repository"
3. Name it `ai-prd-generator`, set it to Public or Private, click "Create repository"
4. Follow the instructions GitHub shows you to push your local code

In your Terminal, from the project folder:
```
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ai-prd-generator.git
git push -u origin main
```

### Step 2 — Deploy to Vercel

Option A — Using the CLI (simplest):
```
vercel --prod
```
Vercel builds your project and deploys it. The output will show your live URL.

Option B — Using the Vercel website (recommended for auto-deployments):
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Connect your GitHub account if you haven't
4. Select the `ai-prd-generator` repository
5. Click "Deploy"

With Option B, every time you push new code to GitHub, Vercel automatically rebuilds and deploys. This is called a CI/CD pipeline.

### Step 3 — Add your API key to Vercel

Your `GEMINI_API_KEY` only exists in `.env.local` on your computer. Vercel doesn't know about it yet. You must add it to Vercel's environment:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find and click your `ai-prd-generator` project
3. Click **"Settings"** in the top navigation
4. Click **"Environment Variables"** in the left sidebar
5. Click **"Add New"**
6. In the **"Name"** field: type `GEMINI_API_KEY` exactly (case-sensitive)
7. In the **"Value"** field: paste your API key
8. Under **"Environments"**: check "Production", optionally check "Preview"
9. Click **"Save"**

### Step 4 — Redeploy

Environment variables only take effect on the next deployment. Go to:
Vercel Dashboard → Your Project → **Deployments** tab → Click the three dots on the latest deployment → **Redeploy**

Or from the Terminal:
```
vercel --prod
```

### Step 5 — Test the live site

Click the URL Vercel gives you. Try generating a PRD. If it works — you're live.

---

## 12. How to Customize This App

### Change the colors

All colors are defined using Tailwind CSS utility classes. The design uses this palette:

| What it's used for | Tailwind class | Hex color |
|---|---|---|
| Page background | `bg-zinc-950` | `#09090b` |
| Card backgrounds | `bg-zinc-900` | `#18181b` |
| Card borders | `border-zinc-800` | `#27272a` |
| Primary accent (indigo) | `bg-indigo-500`, `text-indigo-400` | `#6366f1` |
| Success/integrations (emerald) | `text-emerald-400` | `#10b981` |
| Warnings/P1 (amber) | `text-amber-300` | `#f59e0b` |
| Primary text | `text-zinc-50` | `#fafafa` |
| Muted text | `text-zinc-500` | `#71717a` |

To change the primary accent from indigo to, say, violet:
1. Open `src/App.jsx`, `src/components/PRDOutput.jsx`, `src/components/SectionCard.jsx`, and `src/index.css`
2. Use Find & Replace (⌘+H on Mac) to replace all instances of `indigo` with `violet`
3. Save all files

### Change the example prompts

Open `src/components/ExamplePrompts.jsx`. Edit the strings inside the `EXAMPLES` array:

```jsx
const EXAMPLES = [
  'Your first example prompt here',
  'Your second example prompt here',
  'Your third example prompt here',
  'Your fourth example prompt here',
]
```

### Change what the AI generates

The AI's behavior is entirely controlled by the system prompt at the top of `api/generate-prd.js`. If you want the PRD to include different sections, change the JSON structure in the prompt. Remember: whatever structure you define in the prompt, you must also update the rendering code in `src/components/PRDOutput.jsx` to display the new fields.

### Change the attribution

In `src/App.jsx`, find the attribution footer section and update the name and URL:
```jsx
Built by{' '}
<a href="https://yourwebsite.com">Your Name</a>
```

### Add a new PRD section

1. Add the new field to the JSON structure in the system prompt in `api/generate-prd.js`
2. In `src/components/PRDOutput.jsx`, add a new `<AnimatedSection>` block with a `<SectionCard>` to render the new data
3. In the `formatPRDAsText` function (also in `PRDOutput.jsx`), add the new section to the plain-text output

### Change the character limit display

In `src/App.jsx`, find:
```jsx
const MAX_DISPLAY_CHARS = 200
```
Change `200` to whatever number you want. This only affects the counter display — it doesn't limit input length.

---

## 13. Troubleshooting — When Things Go Wrong

### "command not found: node"

Node.js is not installed. Go back to [Section 4.1](#41--nodejs-version-18-or-higher) and install it.

### "command not found: vercel"

The Vercel CLI is not installed. Run:
```
npm install -g vercel
```

### npm install fails with permission errors (Mac/Linux)

You don't have write permission to the global npm folder. Run:
```
sudo npm install -g vercel
```
Type your computer password when asked (it won't show as you type — that's normal).

### The page loads but "Generate PRD" shows an error

**"Please provide a product idea of at least 10 characters"** — your input is too short.

**"API key not set"** — the `GEMINI_API_KEY` environment variable is missing. If running locally, check that `.env.local` exists and contains your key. If deployed, check Vercel's environment variables settings.

**"AI service error: ..."** — Google's Gemini API returned an error. Common causes:
- Invalid API key (check for typos, spaces, extra quotes)
- Insufficient credits in your Google AI account (add credits at aistudio.google.com)
- Google is experiencing an outage (check status.cloud.google.com)

**"Failed to parse AI response as JSON"** — Gemini returned something that isn't valid JSON. This is rare. Try generating again — the prompt explicitly instructs Gemini to return only JSON.

### `vercel dev` shows "Error: Could not find project"

You haven't linked the project to Vercel yet. Run `vercel` (without `--prod`) first and follow the prompts to link it.

### Changes I make don't appear in the browser

During development with `vercel dev` or `npm run dev`, Vite automatically detects file changes and refreshes the browser (called "Hot Module Replacement"). If it's not working:
1. Save the file (⌘+S on Mac, Ctrl+S on Windows)
2. Wait 1–2 seconds
3. If still not updated, manually refresh the browser (⌘+R or F5)
4. If still not updated, stop the server (Ctrl+C) and restart with `vercel dev`

### The deployed site works but the API returns 500

The API key is set but the function is crashing. Check the logs:
1. Vercel Dashboard → Your Project → **"Logs"** tab
2. Look for error messages next to the `/api/generate-prd` requests
3. The most common cause is `GEMINI_API_KEY` not being set — double-check the Environment Variables in Settings

### "Invalid key" from Google

Your API key is wrong. Common mistakes:
- Extra space at the beginning or end
- You copied only part of the key
- The key was deleted (go to aistudio.google.com → "Get API Key" to check or regenerate)

### The site works locally but not after deployment

Usually caused by missing environment variables on Vercel. The `.env.local` file only exists on your computer — Vercel cannot see it. You must manually add the `GEMINI_API_KEY` in the Vercel dashboard (see [Section 11, Step 3](#step-3--add-your-api-key-to-vercel)).

### I accidentally committed my API key to Git

Revoke it immediately:
1. Go to aistudio.google.com → API Keys
2. Find the key you committed and click the delete/revoke button
3. Create a new key
4. If the repository is on GitHub, the key is still in the git history even after you delete the file. You can ask GitHub Support to purge it, or rotate the key (which you've already done) to neutralize the risk.

---

## 14. Glossary — Every Term Explained

**API (Application Programming Interface)** — A defined way for two software systems to talk to each other. Like a menu at a restaurant: you request from a fixed set of options, and the kitchen (server) prepares and returns the result.

**API Key** — A unique secret string that identifies you when you call an API. It's how the service knows who to charge and whether you're authorized. Treat it like a password.

**Build** — The process of converting your development code (readable, unoptimized) into production code (compressed, optimized for fast loading). `npm run build` does this.

**Bundle** — The single optimized JavaScript file that Vite creates when you build. It contains your entire React app compressed into one file.

**CLI (Command-Line Interface)** — A text-based way to interact with software by typing commands. The opposite of a GUI (Graphical User Interface with windows and icons).

**Component** — In React, a reusable piece of UI. A button, a card, a full page — all can be components. They're like LEGO bricks: you build big things by composing small, reusable pieces.

**CSS (Cascading Style Sheets)** — The language that controls how HTML elements look: colors, fonts, spacing, layout, animations.

**Deploy** — The process of taking code from your computer and publishing it to a server so anyone on the internet can access it.

**Dev Server** — A local server that runs on your computer during development. It serves your files at `http://localhost:3000` (or similar) and watches for file changes to instantly update the browser.

**`dist/` folder** — The output folder Vite creates when you run `npm run build`. It contains optimized HTML, CSS, and JavaScript ready to be served to users. Vercel uploads this folder to its CDN.

**Environment Variable** — A key-value setting that lives in the computer's environment rather than in the code. Allows the same code to behave differently on different machines (e.g., using a test API key locally and a production key on the server).

**Fetch** — A JavaScript function for making HTTP requests. `fetch('/api/generate-prd', {...})` sends a request to the API and returns a Promise.

**Git** — A version control system. It tracks every change to your files over time, lets you roll back to previous versions, and enables collaboration. GitHub is a website that hosts Git repositories.

**HTML (HyperText Markup Language)** — The language that defines the structure of a web page. It's what browsers read to know what elements (headings, paragraphs, images, buttons) a page contains.

**HTTP** — The protocol (communication rules) that browsers and servers use to talk to each other. When you visit a website, your browser sends an HTTP request; the server sends an HTTP response.

**HTTP Status Codes** — Numbers that indicate the result of an HTTP request:
- `200 OK` — success
- `400 Bad Request` — you sent invalid data
- `404 Not Found` — the URL doesn't exist
- `405 Method Not Allowed` — you used GET when only POST is accepted
- `500 Internal Server Error` — the server crashed
- `502 Bad Gateway` — the server tried to call another service and got an error

**JSX** — A syntax extension for JavaScript that lets you write HTML-like code inside `.jsx` files. Browsers don't understand JSX — Vite converts it to regular JavaScript before serving it.

**JSON (JavaScript Object Notation)** — A text format for structured data. Uses `{}` for objects, `[]` for arrays, `""` for strings, and numbers/booleans as-is. It's the universal language of web APIs.

**Localhost** — A special hostname that means "this computer". `http://localhost:3000` means "connect to port 3000 on my own machine". It's how you access a local dev server.

**`node_modules/`** — The folder where npm downloads all the packages for your project. It can be 200MB+. Always in `.gitignore` because it can be regenerated with `npm install`.

**npm (Node Package Manager)** — The tool that installs and manages JavaScript packages. Comes bundled with Node.js.

**npm script** — A shortcut command defined in `package.json`. `npm run build` runs the `build` script, `npm run dev` runs the `dev` script, etc.

**Package** — A reusable piece of code published on the npm registry. `react`, `lucide-react`, and `tailwindcss` are all packages.

**`package.json`** — The configuration file for a Node.js project. Lists the project name, version, scripts, and dependencies.

**PostCSS** — A tool that processes CSS files through plugins. In this project, it runs Tailwind (to generate utility classes) and Autoprefixer (to add browser compatibility prefixes).

**PRD (Product Requirements Document)** — A document that describes what a software product should do, who it's for, and how success will be measured. Written by Product Managers before engineering begins.

**Props** — Short for "properties". In React, props are how you pass data from a parent component to a child component. Like function arguments, but for UI components.

**React** — A JavaScript library for building user interfaces. It lets you build UIs as a tree of components, manages re-rendering when data changes, and makes complex interactive UIs manageable.

**Repository (Repo)** — A folder tracked by Git, usually also stored on GitHub. Contains all the code for a project plus its entire change history.

**Serverless Function** — A function that runs on a cloud provider's server in response to a request. You don't manage the server — you just write the function. Vercel calls them "serverless functions" or "Edge Functions". The file `api/generate-prd.js` is one.

**State** — In React, state is data that can change over time and that the UI should react to. When state changes, React re-renders the affected components.

**Tailwind CSS** — A "utility-first" CSS framework. Instead of writing custom CSS, you apply small pre-defined classes directly in HTML/JSX: `class="bg-zinc-900 text-sm rounded-xl p-4"`. Faster to write, consistent results.

**Token** — The unit Google uses for Gemini billing. Roughly 4 characters = 1 token. Google charges per 1,000 tokens of input + per 1,000 tokens of output. The free tier covers ~60 requests per minute.

**Vite** — A fast modern build tool for JavaScript projects. During development, it serves files with instant hot-reloading. For production, it bundles and optimizes everything.

**Vercel** — A hosting platform specialized for frontend projects and serverless functions. It auto-detects your framework (Vite, Next.js, etc.), builds your project, and deploys it globally on their CDN.

**CDN (Content Delivery Network)** — A network of servers distributed around the world. When Vercel deploys your site to their CDN, users load it from the server closest to them, making it faster globally.

---

## Live Demo

🔗 [Add your Vercel URL here after deploying]

---

Built by [Hrishikesh Kumar](https://hrishikeshkumar.me) · Fractional PM

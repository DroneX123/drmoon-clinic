# How to Run the Application

## Running Locally (Development)

### Prerequisites
- Node.js (v18 or higher)
- npm

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Create a `.env.local` file in the root directory
   - Add your Convex deployment URL:
     ```
     VITE_CONVEX_URL=your_convex_deployment_url
     ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   - Frontend will run on: `http://localhost:5173` (or next available port)
   - The application will hot-reload on file changes

4. **Backend (Convex):**
   - Open a **separate terminal** and run:
     ```bash
     npx convex dev
     ```
   - This starts the Convex development backend on `http://127.0.0.1:3210`
   - Convex functions will automatically sync and hot-reload on changes
   - Keep this terminal running alongside `npm run dev`

---

## How to Run Convex Backend

### First-Time Setup

1. **Install Convex CLI globally (optional but recommended):**
   ```bash
   npm install -g convex
   ```

2. **Initialize Convex (if not already done):**
   ```bash
   npx convex dev
   ```
   - This will prompt you to log in to Convex
   - It creates a `.env.local` file with your deployment URL
   - It generates the `convex/_generated` folder

### Running Convex Locally

**In a separate terminal from your frontend:**

```bash
npx convex dev
```

This command:
- ✅ Starts a local Convex backend server
- ✅ Watches for changes in the `convex/` folder
- ✅ Automatically syncs functions to the local backend
- ✅ Provides a dashboard URL to view logs and data
- ✅ Hot-reloads on file changes

**Important:** Keep both terminals running:
- Terminal 1: `npm run dev` (Frontend - Vite)
- Terminal 2: `npx convex dev` (Backend - Convex)

### Useful Convex Commands

| Command | Description |
|---------|-------------|
| `npx convex dev` | Run Convex in development mode |
| `npx convex deploy` | Deploy Convex functions to production |
| `npx convex dashboard` | Open the Convex dashboard |
| `npx convex logs` | View function logs |
| `npx convex data` | View and edit data in tables |
| `npx convex run <function>` | Run a specific Convex function |

### Environment Variables

Your `.env.local` should contain:
```
CONVEX_DEPLOYMENT=local:local-rayenelahgui09-bookingwebsite
VITE_CONVEX_URL=http://127.0.0.1:3210
```

---

## Running in Production (Deployed)

### Deployment Options

#### Option 1: Vercel (Recommended)
The project is configured for Vercel deployment with `vercel.json`.

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   - Connect your repository to Vercel
   - Vercel will automatically detect the Vite configuration
   - Set environment variables in Vercel dashboard:
     - `VITE_CONVEX_URL`: Your production Convex URL

3. **Access deployed application:**
   - Vercel will provide a production URL (e.g., `https://your-app.vercel.app`)

#### Option 2: Manual Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```
   - This creates optimized files in the `dist/` directory

2. **Preview production build locally:**
   ```bash
   npm run preview
   ```

3. **Deploy the `dist/` folder:**
   - Upload to any static hosting service (Netlify, GitHub Pages, Azure, etc.)
   - Ensure environment variables are configured in your hosting platform

---

## Backend (Convex) Deployment

1. **Production deployment:**
   - Deploy Convex functions to production
   - Update `VITE_CONVEX_URL` in your hosting environment variables
   - Ensure all backend functions are properly deployed via Convex CLI

---

## Quick Reference

| Environment | Command | URL |
|------------|---------|-----|
| **Development** | `npm run dev` | http://localhost:5173 |
| **Production Build** | `npm run build` | N/A (creates dist/) |
| **Preview Build** | `npm run preview` | http://localhost:4173 |
| **Deployed** | N/A | Your hosting URL |

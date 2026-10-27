# Esteban Flores Portfolio

Personal portfolio website for Esteban Flores.

## Live Website

[Visit the portfolio](https://estebanf1612.github.io/esteban-flores-portfolio/)

## Built With

- React 19
- Vite
- React Router
- Firebase Authentication, Firestore, and Storage
- CSS
- GitHub Actions and GitHub Pages

## Features

- Responsive portfolio homepage
- About Me, experience, skills, and projects sections
- Project details and contact pages
- Rotating background images in the About Me section
- Firebase-powered project and skills data
- Protected admin panel for managing portfolio content
- Automatic deployment to GitHub Pages

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/estebanf1612/esteban-flores-portfolio.git
   cd esteban-flores-portfolio
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with the Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The local website will be available at `http://localhost:5173`.

## Available Scripts

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

## Deployment

The site is deployed automatically to GitHub Pages through the workflow in
`.github/workflows/static.yml`. Every push to the `main` branch installs the
dependencies, builds the Vite application, and publishes the `dist` directory.

Firebase values are provided to the GitHub Actions build through repository
secrets. The `.env` file is excluded from Git to prevent configuration values
from being committed.

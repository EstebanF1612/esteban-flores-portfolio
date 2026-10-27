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

## Deployment

The site is deployed automatically to GitHub Pages through the workflow in
`.github/workflows/static.yml`. Every push to the `main` branch installs the
dependencies, builds the Vite application, and publishes the `dist` directory.

Firebase values are provided to the GitHub Actions build through repository
secrets. The `.env` file is excluded from Git to prevent configuration values
from being committed.

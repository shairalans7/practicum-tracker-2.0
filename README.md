# PracticumFlow

Practicum tracker deployed on GitHub Pages and connected to Firebase Authentication and Cloud Firestore.

## Features

- Email/password accounts, email verification, sign-in, and password reset
- Clock-in and clock-out shifts saved to Firestore
- Activity entries with categories, duration calculations, search, filters, editing, and deletion
- Competency totals and charts
- Date-range reports, CSV download, and print/PDF output
- Profile and practicum settings

## Firebase project

The browser configuration currently points to `practicum-tracker-de9e7`, the Firebase project already configured in this backup. To use a separate database for this version, replace `assets/firebase-config.js` and `.firebaserc` with the values from the new Firebase project.

Before using the site, ensure the Firebase project has:

1. Email/Password enabled in Authentication.
2. Cloud Firestore created.
3. The rules in `firestore.rules` published.
4. `shairalans7.github.io` listed under Authentication → Settings → Authorized domains.

Publish the rules with the Firebase CLI by running `firebase deploy --only firestore:rules` from this repository after signing in to the intended Firebase project.

## GitHub Pages

A GitHub Actions workflow publishes the static pages on each push to `main`. Open `login.html` to create an account or sign in.

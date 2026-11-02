# PracticumFlow

Practicum tracker deployed on GitHub Pages. Authentication and records use Firebase Authentication and Cloud Firestore once connected to a dedicated Firebase project.

## Connect a separate Firebase project

1. Create a new Firebase project for this version and add a Web App.
2. Enable Email/Password under Authentication sign-in providers.
3. Create a Cloud Firestore database.
4. Copy that Web App configuration into `assets/firebase-config.js`.
5. Publish `firestore.rules` to the new project.
6. Add `shairalans7.github.io` to Authentication authorized domains.

Do not use the Firebase project from the other practicum tracker version. No Firebase project is selected in this repository.

To publish rules with the Firebase CLI after selecting the new project, run `firebase deploy --only firestore:rules --project YOUR_PROJECT_ID`.

## Features

- Accounts, email verification, sign-in, and password reset
- Clock-in and clock-out shifts
- Activity records, filters, edit, and delete
- Competencies and reports
- CSV and print/PDF reports
- Profile and practicum settings

GitHub Actions publishes the site from `main`.

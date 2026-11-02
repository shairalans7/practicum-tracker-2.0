# PracticumFlow

Practicum tracker deployed on GitHub Pages. Firebase project for this version: `practicum2-c2164`.

## Connect Firebase

The Firebase Web App configuration for `practicum2-c2164` is still needed in `assets/firebase-config.js`. In Firebase Console, open Project settings → General → Your apps, register a Web App if needed, then copy its complete `firebaseConfig` object into that file.

Then ensure the project has:

1. Email/Password enabled in Authentication.
2. Cloud Firestore created.
3. The rules in `firestore.rules` published.
4. `shairalans7.github.io` listed under Authentication authorized domains.

The Firebase CLI default project is set to `practicum2-c2164`. Publish the rules with `firebase deploy --only firestore:rules` after signing in to that Firebase project.

Do not add a service-account key or private key to this repository.

## Features

- Accounts, email verification, sign-in, and password reset
- Clock-in and clock-out shifts
- Activity records, filters, edit, and delete
- Competencies and reports
- CSV and print/PDF reports
- Profile and practicum settings

GitHub Actions publishes the site from `main`.

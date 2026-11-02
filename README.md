# PracticumFlow Version 2

PracticumFlow interface served by GitHub Pages and connected to Firebase Authentication and Cloud Firestore. The Firebase project is `practicum2-c2164`.

## Features

- Email/password accounts with verification and password reset
- Clock-in and clock-out records
- Activity logs and category totals
- Practicum settings and time reports
- PDF reports

## Firebase setup

1. Enable Email/Password in Firebase Authentication.
2. Create the Firestore database.
3. Publish `firestore.rules` to project `practicum2-c2164`.
4. Add `shairalans7.github.io` to Authentication authorized domains.

The app uses `assets/firebase-bootstrap.js` to connect the PracticumFlow interface to Firebase. The project alias is set in `.firebaserc`; publish rules with `firebase deploy --only firestore:rules`.

GitHub Actions deploys this site from `main`.

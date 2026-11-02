# PracticumFlow Version 2

PracticumFlow Version 2 runs in two modes: the published GitHub Pages site uses Firebase Authentication and Cloud Firestore, while `localhost` uses browser localStorage for an offline demo. The Firebase project is `practicum2-c2164`.

The localhost demo uses a separate local account and separate local records. It does not require internet and does not sync its data with Firebase.

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

The app uses `assets/firebase-bootstrap.js` to select the localStorage backend on `localhost` or the Firebase backend on the published site. The project alias is set in `.firebaserc`; publish rules with `firebase deploy --only firestore:rules`.

GitHub Actions deploys this site from `main`.

## User and developer guide

For instructions on using the tracker, running it on another laptop, configuring Firebase, and publishing updates, see [GABAY-SA-PRACTICUMFLOW.md](GABAY-SA-PRACTICUMFLOW.md).

# Church Student Registration

A public student registration form backed by Cloud Firestore, with a Google-authenticated administrator dashboard and Excel export.

## Set up Firebase

1. Create a Firebase project, register a Web app, and create a Cloud Firestore database.
2. In **Authentication > Sign-in method**, enable Google. Add your deployment domain under **Authentication > Settings > Authorized domains**.
3. Copy `.env.example` to `.env` and fill in the web app configuration from **Project settings > Your apps**.
4. Install dependencies with `npm install`, then start the app with `npm run dev`.
5. Open `http://localhost:5173/#admin` and sign in with the Google account that should manage registrations. Copy the UID shown for an account that is not yet allowlisted.
6. Replace `REPLACE_WITH_ADMIN_UID` in `firestore.rules` with that UID. Set the same UID in `VITE_FIREBASE_ADMIN_UIDS` in `.env` (multiple UIDs can be comma-separated).
7. Deploy the site and Firestore rules as described below, then add the deployed domain to Firebase Authentication's authorized domains.

The UID list in the client app only controls the dashboard experience; Firestore rules are the actual access control. Do not publish permissive rules. The rules allow anonymous registration creation but allow reads, updates, and deletes only to the listed admin UIDs.

## Publish and share the registration link

Anyone with the public link can submit registrations without signing in. The administrator dashboard remains protected; do not make reads public.

1. Copy `.env.example` to `.env` and add the Firebase web app settings and admin UID as above.
2. Replace `REPLACE_WITH_ADMIN_UID` in `firestore.rules` with the authorized admin UID.
3. Sign in to Firebase CLI with `npx firebase-tools login`.
4. Deploy the site and rules, replacing the project ID with your Firebase project ID:

	```sh
	npm run build
	npx firebase-tools deploy --only hosting,firestore:rules --project YOUR_FIREBASE_PROJECT_ID
	```

5. Add `YOUR_FIREBASE_PROJECT_ID.web.app` to Firebase Authentication's authorized domains.
6. Share `https://YOUR_FIREBASE_PROJECT_ID.web.app` with the people helping register students. The **Copy link** button on the form copies the public registration URL.

The form link is public by design, so anyone who receives it can submit a registration. Keep the admin dashboard link and UID allowlist private.

## Run and build

```sh
npm install
npm run dev
npm run build
```

The public form is at `/` and the admin dashboard is at `/#admin`. Registration documents are written to `student_registrations` with server-generated timestamps. The admin dashboard can search records and export the full list as `student-registrations.xlsx`.
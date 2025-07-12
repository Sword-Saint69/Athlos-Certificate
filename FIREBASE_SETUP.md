# Firebase Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter your project name (e.g., "athlos-certificates")
4. Follow the setup wizard

## 2. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location close to your users

## 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" and choose Web
4. Register your app and copy the config

## 4. Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 5. Add Sample Data

Add this sample certificate to your Firestore collection named "certificates":

```json
{
  "name": "Jane Doe",
  "eventName": "ATHLOS Tech Summit 2025",
  "date": "November 15, 2025",
  "certificateId": "ATHLOS25-JD-001",
  "imageUrl": "/placeholder.svg?height=300&width=400",
  "universityCode": "PRP24CS068",
  "email": "jane.doe@example.com",
  "department": "Computer Science",
  "year": "2024"
}
```

## 6. Test the Application

1. Start your development server: `pnpm dev`
2. Enter "PRP24CS068" in the university code field
3. The certificate should be retrieved from Firebase

## 7. Security Rules (Optional)

For production, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /certificates/{document} {
      allow read: if true; // Anyone can read certificates
      allow write: if false; // Only admin can write (via Firebase Console)
    }
  }
}
``` 
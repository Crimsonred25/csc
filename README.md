# CSC Review Hub

**About**

A comprehensive learning portal for Civil Service Examination preparation, featuring flashcards, practice exams, and review guides for DOTr employees.

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any changes made to the code will be reflected when the app is rebuilt and deployed.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Build and Deploy**

Run `npm run build` to create a production build for deployment.

**Environment Configuration**

Make sure your `.env.local` file contains the correct Base44 app ID and URL for proper functionality.

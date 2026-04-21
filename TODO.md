# CSC Deployment TODO

## Steps:
- [x] 1. Install dependencies: npm install (625 packages + audits, minor warnings ok)
- [x] 2. Start local dev server: npm run dev (http://localhost:5173) - running
- [x] 3. Build for production: npm run build (success: dist/ created)
- [x] 4. Preview production locally: npm run preview (http://localhost:4173) - running
- [ ] 5. Check git remote and deploy to Vercel (vercel --prod) - running (no git)

**Firebase Auth Migration:**
- [x] Install firebase
- [ ] Update firebase.js config (console.firebase.google.com)
- [ ] Refactor AuthContext.jsx for Firebase
- [ ] Update Landing.jsx forms (login/register)
- [ ] Test
Updated as steps complete.

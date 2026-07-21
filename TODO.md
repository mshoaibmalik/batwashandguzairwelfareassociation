# Firebase connection task (progress)

- [x] Read repo firebase/auth/store/rules files
- [x] Add `.env.local` (VITE*FIREBASE*\* placeholders)
- [x] Implement Firestore data layer in `src/lib/db.ts`
- [x] Swap `src/lib/store.ts` to use Firestore when configured (keep localStorage fallback)
- [ ] Run TypeScript/build + fix any errors
- [ ] Run dev server and verify admin login + CRUD persistence
- [ ] Ensure admin user exists in Auth and `admins/{uid}` document exists
- [ ] Deploy/firestore.rules deploy if needed

# Community Welfare Fund — Plan

## Important note on stack

This Lovable project runs on **TanStack Start (Vite + React 19)**, not Create-React-App. The routing convention is file-based under `src/routes/` (not `react-router-dom`). Everything you asked for still works — same React, same Tailwind, same Firebase SDK — but routes will use TanStack Router instead of `react-router-dom`. If you specifically need `react-router-dom`, tell me and I'll swap, though it fights the template.

You chose "Plain shell, I'll wire Firebase myself," so I will:

- Build all screens, navigation, components, and a typed data-service layer.
- Add a Firebase config file with `VITE_FIREBASE_*` env placeholders.
- Ship working Firebase Auth + Firestore service modules (you just paste your config).
- Seed an English + Urdu i18n toggle and Rs. currency formatting.
- Include `firestore.rules` and a `README` with deploy steps for Firebase Hosting.

I will NOT run/deploy Firebase from Lovable — you'll run `firebase deploy` locally.

## Folder structure

```
src/
  routes/
    __root.tsx                  # shell + bottom nav (public) / drawer (admin)
    index.tsx                   # public Home dashboard
    families.tsx
    collections.tsx
    expenses.tsx
    events.tsx
    events.$eventId.tsx
    admin/
      login.tsx
      _layout.tsx               # auth guard + drawer
      dashboard.tsx
      families.tsx
      collections.tsx
      expenses.tsx
      events.tsx
      reports.tsx
  components/
    ui/ (shadcn already present)
    layout/{BottomNav,AdminDrawer,PageHeader}.tsx
    cards/{StatCard,TxRow,FamilyCard,EventCard}.tsx
    forms/{FamilyForm,CollectionForm,ExpenseForm,EventForm}.tsx
    common/{EmptyState,LoadingState,ConfirmDialog,SearchBar,Pagination}.tsx
  lib/
    firebase.ts                 # initializeApp from import.meta.env.VITE_FIREBASE_*
    auth.ts                     # signIn, signOut, onAuthChange
    db/{families,collections,expenses,events}.ts  # CRUD + realtime onSnapshot
    money.ts                    # Rs. formatter
    i18n.ts                     # en/ur dictionary + useT() hook
    pdf.ts / excel.ts           # jsPDF + xlsx export helpers
  context/
    AuthContext.tsx
    LangContext.tsx
  hooks/
    useFamilies, useCollections, useExpenses, useEvents, useFundSummary
  styles.css                    # Tailwind v4 theme tokens
firestore.rules
.env.example
README-firebase.md
```

## Design system

- Tailwind v4 tokens in `src/styles.css`: primary `#0F766E`, secondary `#14B8A6`, success `#16A34A`, warning `#EA580C`, danger `#DC2626`, background `#F8FAFC`. Rounded-2xl cards, soft shadows, Inter font.
- Mobile-first breakpoints; fixed bottom nav (public) with 5 tabs; admin uses Sheet drawer.
- shadcn components for Dialog, Sheet, Form, Toast (sonner), Tabs, Select, Table.

## Data model (Firestore)

- `families/{id}`: name, head, phone, address, status, createdAt
- `collections/{id}`: familyId, type (`monthly`|`special`), amount, date, monthsCovered[], eventId?, notes
- `events/{id}`: familyId, eventDate, description, type=`bereavement`, totalExpense (denormalised)
- `expenses/{id}`: eventId, category (food|tent|transport|misc), amount, date, description
- `admins/{uid}`: role=`admin`

Derived: `balance = sum(collections.amount) - sum(expenses.amount)`. Computed client-side from realtime snapshots, cached in `useFundSummary`.

## Auth & routing

- `AuthContext` wraps `onAuthStateChanged`. Admin layout redirects to `/admin/login` if not signed in or uid not in `admins/`.
- Public routes never require auth.
- No signup UI — admin docs explain creating users in Firebase console + adding `admins/{uid}` doc.

## Features per page

- Home: 4 stat cards (Balance, Collections, Expenses, Families) + 3 recent lists.
- Families: searchable list, totals per family.
- Collections: tabs Monthly/Special, search by family, date range.
- Expenses: filter by event/category.
- Events: list → detail page with linked expenses + special collections.
- Admin Dashboard: same stats + Recharts (monthly collections vs expenses bar, category pie).
- Admin CRUD pages: shadcn Dialog forms with zod validation.
- Reports: tables + PDF (jsPDF + autotable) and Excel (xlsx) export.

## i18n

- Lightweight: `LangContext` with `en` / `ur` dictionaries, toggle in header, `dir="rtl"` on `<html>` when Urdu. Numbers stay Latin; currency formatted as `Rs. 1,200`.

## Packages to add

`firebase`, `recharts`, `jspdf`, `jspdf-autotable`, `xlsx`, `date-fns`, `zod` (already), `sonner` (toast).

## What you do after I build

1. Create Firebase project → enable Email/Password auth + Firestore.
2. Copy web config into `.env.local` using `.env.example` keys.
3. `firebase login && firebase init hosting` → `npm run build` → `firebase deploy`.
4. Create your admin user in Firebase Auth console, then add a Firestore doc `admins/{uid}` `{ role: "admin" }`. README will spell this out with your email.

## Admin email to seed in README

Please paste the admin email in your next message so I can hardcode it into the README setup instructions and the `firestore.rules` comment.

## Out of scope (call out if you want them)

- Server-side PDF generation, SMS/WhatsApp notifications, offline PWA, payment gateway, multi-org support.

Reply with the admin email and "go" and I'll build it.

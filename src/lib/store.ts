/**
 * Reactive Firestore data store.
 *
 * All data is persisted via Firestore with real‑time subscriptions.
 * Auto‑seeds dummy data when Firestore is empty.
 */
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type FamilyStatus = "active" | "inactive";

export interface Family {
  id: string;
  name: string;
  head: string;
  phone: string;
  address: string;
  status: FamilyStatus;
  createdAt: string;
}

export type CollectionType = "monthly" | "special";

export interface Collection {
  id: string;
  familyId: string;
  type: CollectionType;
  amount: number;
  date: string; // ISO yyyy-mm-dd
  monthsCovered: string[]; // ["2026-06", ...] for monthly
  eventId?: string | null; // for special
  notes?: string;
}

export interface WelfareEvent {
  id: string;
  familyId: string;
  eventDate: string;
  description: string;
  type: "bereavement";
}

export type ExpenseCategory = "food" | "tent" | "transport" | "misc";

export interface Expense {
  id: string;
  eventId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
}

export interface DataState {
  families: Family[];
  collections: Collection[];
  events: WelfareEvent[];
  expenses: Expense[];
}

/* ------------------------------------------------------------------ */
/*  Firestore collection refs & helpers                                */
/* ------------------------------------------------------------------ */

const COLLECTIONS = {
  families: "families",
  collections: "collections",
  events: "events",
  expenses: "expenses",
} as const;

type ColName = keyof typeof COLLECTIONS;

/** Serialize a value (handles Timestamps from Firestore). */
function serialize(val: unknown): unknown {
  if (val && typeof val === "object" && "toDate" in (val as Timestamp)) {
    return (val as Timestamp).toDate().toISOString().slice(0, 10);
  }
  return val;
}

function docTo<T extends { id: string }>(d: DocumentData): T {
  const raw = d.data();
  const out: Record<string, unknown> = { id: d.id };
  for (const key of Object.keys(raw)) {
    out[key] = serialize(raw[key]);
  }
  return out as T;
}

/* ------------------------------------------------------------------ */
/*  Seed data                                                          */
/* ------------------------------------------------------------------ */

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function generateSeed() {
  const f1: Family = { id: uid(), name: "Ahmed", head: "Muhammad Ahmed", phone: "0300-1234567", address: "House 12, Street 4", status: "active", createdAt: "2026-01-05" };
  const f2: Family = { id: uid(), name: "Khan", head: "Asif Khan", phone: "0301-2345678", address: "House 7, Street 1", status: "active", createdAt: "2026-01-05" };
  const f3: Family = { id: uid(), name: "Siddiqui", head: "Tariq Siddiqui", phone: "0302-3456789", address: "House 22, Street 6", status: "active", createdAt: "2026-01-05" };
  const f4: Family = { id: uid(), name: "Malik", head: "Imran Malik", phone: "0303-4567890", address: "House 5, Street 2", status: "active", createdAt: "2026-01-05" };
  const f5: Family = { id: uid(), name: "Sheikh", head: "Bilal Sheikh", phone: "0304-5678901", address: "House 18, Street 9", status: "inactive", createdAt: "2026-01-05" };
  const families = [f1, f2, f3, f4, f5];

  const months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
  const collections: Collection[] = [];
  for (const f of families.filter((x) => x.status === "active")) {
    collections.push({ id: uid(), familyId: f.id, type: "monthly", amount: 300 * 3, date: "2026-03-10", monthsCovered: months.slice(0, 3), notes: "Q1" });
    collections.push({ id: uid(), familyId: f.id, type: "monthly", amount: 300 * 3, date: "2026-06-08", monthsCovered: months.slice(3, 6), notes: "Q2" });
  }

  const ev1: WelfareEvent = { id: uid(), familyId: f2.id, eventDate: "2026-04-18", description: "Bereavement of elder family member", type: "bereavement" };
  const ev2: WelfareEvent = { id: uid(), familyId: f3.id, eventDate: "2026-05-22", description: "Foatgi arrangements", type: "bereavement" };
  const events = [ev1, ev2];

  const expenses: Expense[] = [
    { id: uid(), eventId: ev1.id, category: "food", amount: 18000, date: "2026-04-18", description: "Lunch for 120 people" },
    { id: uid(), eventId: ev1.id, category: "tent", amount: 6000, date: "2026-04-18", description: "Shamiana" },
    { id: uid(), eventId: ev1.id, category: "transport", amount: 2500, date: "2026-04-18" },
    { id: uid(), eventId: ev2.id, category: "food", amount: 22000, date: "2026-05-22", description: "Dinner" },
    { id: uid(), eventId: ev2.id, category: "misc", amount: 1500, date: "2026-05-22", description: "Supplies" },
  ];

  collections.push({ id: uid(), familyId: f1.id, type: "special", amount: 1000, date: "2026-04-20", monthsCovered: [], eventId: ev1.id, notes: "Special contribution" });
  collections.push({ id: uid(), familyId: f4.id, type: "special", amount: 1500, date: "2026-04-20", monthsCovered: [], eventId: ev1.id });

  return { families, collections, events, expenses };
}

/** Check if a Firestore collection is empty and seed if so. */
async function seedIfEmpty<T extends { id: string }>(colName: ColName, docs: T[]) {
  const colRef = collection(db, COLLECTIONS[colName]);
  const snap = await getDocs(colRef);
  if (snap.size > 0) return; // already seeded

  for (const d of docs) {
    const { id, ...rest } = d;
    await setDoc(doc(colRef, id), rest as Record<string, unknown>);
  }
  console.log(`[seed] Seeded ${docs.length} documents into "${colName}".`);
}

/** Seed all collections with dummy data if they are empty. */
export async function seedFirestoreIfEmpty() {
  const data = generateSeed();
  await seedIfEmpty("families", data.families);
  await seedIfEmpty("collections", data.collections);
  await seedIfEmpty("events", data.events);
  await seedIfEmpty("expenses", data.expenses);
  if (typeof window !== "undefined") {
    console.log("[seed] Firestore seed check complete.");
  }
}

/* ------------------------------------------------------------------ */
/*  Reactive state (in‑memory mirror + Firestore sync)                 */
/* ------------------------------------------------------------------ */

/** Current data state (in‑memory mirror). */
let state: DataState = { families: [], collections: [], events: [], expenses: [] };

/** Set of React subscriber callbacks. */
const listeners = new Set<() => void>();

/** Notify all React subscribers. */
function notify() {
  listeners.forEach((fn) => fn());
}

/* ------------------------------------------------------------------ */
/*  Real‑time subscriptions management                                */
/* ------------------------------------------------------------------ */

const unsubscribers = new Map<ColName, () => void>();
let subscriptionsStarted = false;

function onCollectionChange<T extends { id: string }>(
  colName: ColName,
  setter: (items: T[]) => void,
) {
  const colRef = collection(db, COLLECTIONS[colName]);
  const q = query(colRef, orderBy("__name__"));

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => docTo<T>(d));
    setter(items);
    notify();
  });
}

let seedingPromise: Promise<void> | null = null;

async function startSubscriptions() {
  // Seed Firestore first (only once, wait for it)
  if (!seedingPromise) {
    seedingPromise = seedFirestoreIfEmpty();
  }
  await seedingPromise;

  if (subscriptionsStarted) return;
  subscriptionsStarted = true;

  unsubscribers.set(
    "families",
    onCollectionChange<Family>("families", (items) => {
      state = { ...state, families: items };
    }),
  );
  unsubscribers.set(
    "collections",
    onCollectionChange<Collection>("collections", (items) => {
      state = { ...state, collections: items };
    }),
  );
  unsubscribers.set(
    "events",
    onCollectionChange<WelfareEvent>("events", (items) => {
      state = { ...state, events: items };
    }),
  );
  unsubscribers.set(
    "expenses",
    onCollectionChange<Expense>("expenses", (items) => {
      state = { ...state, expenses: items };
    }),
  );
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function ensureStoreLoaded() {
  startSubscriptions();
}

export const store = {
  get(): DataState {
    return state;
  },

  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  reset() {
    // No‑op – Firestore is the source of truth.
  },

  /* ---- Families --------------------------------------------------- */

  async addFamily(f: Omit<Family, "id" | "createdAt">) {
    const colRef = collection(db, COLLECTIONS.families);
    const docRef = doc(colRef);
    const createdAt = new Date().toISOString().slice(0, 10);
    await setDoc(docRef, { ...f, createdAt });
  },

  async updateFamily(id: string, patch: Partial<Family>) {
    const docRef = doc(db, COLLECTIONS.families, id);
    await updateDoc(docRef, patch);
  },

  async deleteFamily(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.families, id));
  },

  /* ---- Collections ------------------------------------------------ */

  async addCollection(c: Omit<Collection, "id">) {
    const colRef = collection(db, COLLECTIONS.collections);
    const docRef = doc(colRef);
    await setDoc(docRef, c);
  },

  async updateCollection(id: string, patch: Partial<Collection>) {
    const docRef = doc(db, COLLECTIONS.collections, id);
    await updateDoc(docRef, patch);
  },

  async deleteCollection(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.collections, id));
  },

  /* ---- Events ----------------------------------------------------- */

  async addEvent(e: Omit<WelfareEvent, "id" | "type"> & { type?: "bereavement" }) {
    const colRef = collection(db, COLLECTIONS.events);
    const docRef = doc(colRef);
    await setDoc(docRef, { ...e, type: "bereavement" });
  },

  async updateEvent(id: string, patch: Partial<WelfareEvent>) {
    const docRef = doc(db, COLLECTIONS.events, id);
    await updateDoc(docRef, patch);
  },

  async deleteEvent(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.events, id));
    // Cascade delete linked expenses
    const snap = await getDocs(collection(db, COLLECTIONS.expenses));
    const batch = snap.docs.filter((d) => d.data().eventId === id);
    for (const d of batch) {
      await deleteDoc(d.ref);
    }
  },

  /* ---- Expenses --------------------------------------------------- */

  async addExpense(e: Omit<Expense, "id">) {
    const colRef = collection(db, COLLECTIONS.expenses);
    const docRef = doc(colRef);
    await setDoc(docRef, e);
  },

  async updateExpense(id: string, patch: Partial<Expense>) {
    const docRef = doc(db, COLLECTIONS.expenses, id);
    await updateDoc(docRef, patch);
  },

  async deleteExpense(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.expenses, id));
  },
};

/* ------------------------------------------------------------------ */
/*  React hooks                                                        */
/* ------------------------------------------------------------------ */

export function useStore<T>(selector: (s: DataState) => T): T {
  const [, setTick] = useState(0);

  useEffect(() => {
    startSubscriptions().then(() => setTick((t) => t + 1));

    const unsub = store.subscribe(() => setTick((t) => t + 1));
    return () => {
      unsub();
    };
  }, []);

  return selector(state);
}

export function useFundSummary() {
  return useStore((s) => {
    const totalCollections = s.collections.reduce((a, c) => a + c.amount, 0);
    const totalExpenses = s.expenses.reduce((a, e) => a + e.amount, 0);
    const activeFamilies = s.families.filter((f) => f.status === "active").length;
    return {
      balance: totalCollections - totalExpenses,
      totalCollections,
      totalExpenses,
      totalFamilies: s.families.length,
      activeFamilies,
      totalEvents: s.events.length,
    };
  });
}

export function familyTotals(familyId: string, s: DataState) {
  const cs = s.collections.filter((c) => c.familyId === familyId);
  const monthly = cs.filter((c) => c.type === "monthly").reduce((a, c) => a + c.amount, 0);
  const special = cs.filter((c) => c.type === "special").reduce((a, c) => a + c.amount, 0);
  const last = cs
    .map((c) => c.date)
    .sort()
    .slice(-1)[0];
  return { total: monthly + special, monthly, special, last };
}

/* ------------------------------------------------------------------ */
/*  One‑time migration from localStorage                               */
/* ------------------------------------------------------------------ */

/**
 * Import existing localStorage data into Firestore.
 * Call this once from browser console:
 *   import { migrateLocalStorageToFirestore } from './src/lib/store'
 *   await migrateLocalStorageToFirestore()
 */
export async function migrateLocalStorageToFirestore() {
  const KEY = "welfare-fund.v1";
  const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
  if (!raw) {
    console.log("[migrate] No localStorage data found.");
    return;
  }

  let localData: DataState;
  try {
    localData = JSON.parse(raw);
  } catch {
    console.error("[migrate] Failed to parse localStorage data.");
    return;
  }

  const { families, collections, events, expenses } = localData;

  for (const f of families) {
    const { id, ...rest } = f;
    await setDoc(doc(db, COLLECTIONS.families, id), rest);
  }
  console.log(`[migrate] Imported ${families.length} families.`);

  for (const c of collections) {
    const { id, ...rest } = c;
    await setDoc(doc(db, COLLECTIONS.collections, id), rest);
  }
  console.log(`[migrate] Imported ${collections.length} collections.`);

  for (const e of events) {
    const { id, ...rest } = e;
    await setDoc(doc(db, COLLECTIONS.events, id), rest);
  }
  console.log(`[migrate] Imported ${events.length} events.`);

  for (const exp of expenses) {
    const { id, ...rest } = exp;
    await setDoc(doc(db, COLLECTIONS.expenses, id), rest);
  }
  console.log(`[migrate] Imported ${expenses.length} expenses.`);

  console.log("[migrate] Migration complete!");
}
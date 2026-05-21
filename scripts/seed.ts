/**
 * One-shot Firestore seed:
 * pushes categories, branches, products, and the admin doc into Firestore.
 *
 * Usage:
 *   SEED_ADMIN_EMAIL=...  SEED_ADMIN_PASSWORD=...  npm run seed
 *
 * The admin credentials must already exist in Firebase Auth
 * (Authentication → Users → Add user).
 *
 * Firestore security rules require an authenticated admin to write,
 * so the script signs in first, then performs the writes.
 */
import { config as loadEnv } from "dotenv";
import path from "node:path";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { categories } from "../src/data/categories";
import { branches } from "../src/data/branches";
import { products } from "../src/data/products";
import { COL } from "../src/lib/firebase/schema";

/** Strip undefined fields — Firestore rejects them with INVALID_ARGUMENT. */
function clean<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as T;
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function assertConfig() {
  const missing = Object.entries(cfg)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase env vars: ${missing.join(", ")}\n` +
        `Make sure .env.local exists in the project root.`
    );
  }
  if (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD) {
    throw new Error(
      `Missing SEED_ADMIN_EMAIL and/or SEED_ADMIN_PASSWORD env vars.\n` +
        `Example (Bash):  SEED_ADMIN_EMAIL=you@x.com SEED_ADMIN_PASSWORD=secret npm run seed`
    );
  }
}

async function main() {
  assertConfig();

  console.log("→ Initializing Firebase…");
  const app = initializeApp(cfg);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`→ Signing in as ${process.env.SEED_ADMIN_EMAIL}…`);
  const cred = await signInWithEmailAndPassword(
    auth,
    process.env.SEED_ADMIN_EMAIL!,
    process.env.SEED_ADMIN_PASSWORD!
  );
  const uid = cred.user.uid;
  console.log(`✓ Authenticated as ${cred.user.email} (uid: ${uid})`);

  // ── Admin doc (so Security Rules can verify role) ────────────────────────
  console.log("→ Writing admin doc…");
  await setDoc(
    doc(db, COL.admins, uid),
    clean({
      uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      role: "super",
      createdAt: Date.now(),
    })
  );

  // ── Categories ───────────────────────────────────────────────────────────
  console.log(`→ Seeding ${categories.length} categories…`);
  let batch = writeBatch(db);
  categories.forEach((c, i) => {
    batch.set(doc(db, COL.categories, c.slug), { ...c, sortOrder: i });
  });
  await batch.commit();

  // ── Branches ─────────────────────────────────────────────────────────────
  console.log(`→ Seeding ${branches.length} branches…`);
  batch = writeBatch(db);
  branches.forEach((b) => {
    batch.set(doc(db, COL.branches, b.id), b);
  });
  await batch.commit();

  // ── Products (with per-branch stock map) ─────────────────────────────────
  console.log(`→ Seeding ${products.length} products…`);
  const branchIds = branches.map((b) => b.id);
  const now = Date.now();

  // Firestore caps batches at 500 writes, well within our 35 products
  batch = writeBatch(db);
  products.forEach((p) => {
    const stockMap: Record<string, number> = {};
    for (const bid of branchIds) stockMap[bid] = p.stock;

    batch.set(
      doc(db, COL.products, p.id),
      clean({
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        description: p.description,
        price: p.price,
        oldPrice: p.oldPrice,
        unit: p.unit,
        image: p.image,
        category: p.category,
        stock: stockMap,
        rating: p.rating,
        tags: p.tags ?? [],
        featured: p.featured ?? false,
        createdAt: now,
        updatedAt: now,
      })
    );
  });
  await batch.commit();

  console.log("\n✅ Seed complete.\n");
  console.log("Next:");
  console.log(`  • Check Firestore → ${COL.products} (${products.length} docs)`);
  console.log(`  • Check Firestore → ${COL.categories} (${categories.length} docs)`);
  console.log(`  • Check Firestore → ${COL.branches} (${branches.length} docs)`);
  console.log(`  • Check Firestore → ${COL.admins} (1 doc)`);

  // Force exit — the client SDK keeps the process alive otherwise
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Seed failed:\n", err);
  process.exit(1);
});

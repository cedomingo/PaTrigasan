/**
 * Run with: npm run seed:check
 *
 * Writes a dummy document to a `_healthcheck` collection, reads it back,
 * then deletes it. Confirms your .env.local Firebase config is wired up
 * correctly and Firestore rules allow read/write from the client SDK.
 */
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

async function main() {
  const ref = doc(db, "_healthcheck", "ping");
  const payload = { ok: true, checkedAt: Date.now() };

  console.log("Writing dummy document...");
  await setDoc(ref, payload);

  console.log("Reading it back...");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("Document was written but could not be read back.");
  }
  console.log("Read:", snap.data());

  console.log("Cleaning up...");
  await deleteDoc(ref);

  console.log("✅ Firestore read/write confirmed working.");
}

main().catch((err) => {
  console.error("❌ Firestore check failed:", err);
  process.exit(1);
});

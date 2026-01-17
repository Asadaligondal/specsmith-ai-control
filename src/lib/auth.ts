import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function signUpWithEmail(
  email: string,
  password: string,
  profile: Record<string, any> = {}
) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;
  await setDoc(doc(db, "users", uid), {
    email,
    ...profile,
    createdAt: serverTimestamp(),
  });
  return userCred.user;
}

export async function signInWithEmail(email: string, password: string) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function signOutUser() {
  await firebaseSignOut(auth);
}

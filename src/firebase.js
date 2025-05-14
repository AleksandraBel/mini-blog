import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB7-4ZVRr7YGB4-xa7Um6-l9CuX_-b-DyQ",
  authDomain: "mini-blog-e1c69.firebaseapp.com",
  projectId: "mini-blog-e1c69",
  storageBucket: "mini-blog-e1c69.appspot.com",
  messagingSenderId: "44310306609",
  appId: "1:44310306609:web:a2a02559340b135acc1a10",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export const storage = getStorage(app);
export { app, auth, db };

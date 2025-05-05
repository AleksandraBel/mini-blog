import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

export { app, auth, db };

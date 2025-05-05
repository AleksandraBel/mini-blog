import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

const postsCollectionRef = collection(db, "posts");

// Створення поста
export const createPost = async (post) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Користувач не авторизований.");
  }

  const postWithAuthor = {
    ...post,
    authorId: user.uid,
    authorEmail: user.email,
    createAd: new Date(),
  };

  await addDoc(postsCollectionRef, postWithAuthor);
};

// Оновлення поста
export const updatePost = async (id, updatedPost) => {
  const postDoc = doc(db, "posts", id);
  await updateDoc(postDoc, updatedPost);
};

// Видалення поста
export const deletePost = async (id) => {
  const postDoc = doc(db, "posts", id);
  await deleteDoc(postDoc);
};

// Отримання одного поста
export const getPost = async (id) => {
  const postDoc = doc(db, "posts", id);
  const postSnapshot = await getDoc(postDoc);
  return postSnapshot.data();
};

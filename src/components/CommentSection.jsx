import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/useAuth";

const CommentSection = ({ postId }) => {
  const { currentUser, userData } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetched);
    });

    return () => unsubscribe();
  }, [postId]);

  const isAdmin = userData?.role === "admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: commentText.trim(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(),
      });
      setCommentText("");
    } catch (error) {
      console.error("Помилка додавання коментаря:", error);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const ref = doc(db, "posts", postId, "comments", commentId);
      await deleteDoc(ref);
    } catch (error) {
      console.error("Помилка видалення коментаря:", error);
    }
  };

  const handleEdit = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
  };

  const handleEditSave = async () => {
    try {
      const ref = doc(db, "posts", postId, "comments", editingCommentId);
      await updateDoc(ref, {
        text: editText.trim(),
      });
      setEditingCommentId(null);
      setEditText("");
    } catch (error) {
      console.error("Помилка редагування коментаря:", error);
    }
  };

  const canManageComment = (comment) =>
    currentUser && (comment.authorId === currentUser.uid || isAdmin);

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Коментарі</h3>

      {currentUser && (
        <form onSubmit={handleSubmit}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Напишіть коментар..."
            className="w-full p-2 border rounded"
            rows={3}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
          >
            Надіслати
          </button>
        </form>
      )}

      {comments.length === 0 && (
        <p className="mt-4 text-gray-500">Ще немає коментарів.</p>
      )}

      <div className="mt-6 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b pb-2">
            {editingCommentId === comment.id ? (
              <>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={2}
                />
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleEditSave}
                    className="text-green-600 text-sm"
                  >
                    Зберегти
                  </button>
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="text-gray-500 text-sm"
                  >
                    Скасувати
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-800">{comment.text}</p>
                <p className="text-sm text-gray-500">
                  Автор: {comment.authorName} •{" "}
                  {comment.createdAt?.toDate?.()
                    ? comment.createdAt.toDate().toLocaleString()
                    : "невідомо"}
                </p>
                {canManageComment(comment) && (
                  <div className="flex gap-3 mt-1 text-sm">
                    {(comment.authorId === currentUser.uid || isAdmin) && (
                      <button
                        onClick={() => handleEdit(comment.id, comment.text)}
                        className="text-blue-500"
                      >
                        Редагувати
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-500"
                    >
                      Видалити
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;

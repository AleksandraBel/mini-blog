import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/useAuth";

const CommentSection = ({ postId }) => {
  const { currentUser, userData } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetched = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const comment = { id: docSnap.id, ...docSnap.data() };

          let nickname = "Анонім";
          let profileImageUrl = "/default-avatar.png";

          if (comment.authorId) {
            try {
              const userDoc = await getDoc(doc(db, "users", comment.authorId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                nickname = userData.nickname || nickname;
                profileImageUrl = userData.profileImageUrl || profileImageUrl;
              }
            } catch (err) {
              console.error("Помилка при завантаженні автора:", err);
            }
          }

          return {
            ...comment,
            authorNickname: nickname,
            authorPhotoURL: profileImageUrl,
          };
        })
      );

      setComments(fetched);
    });

    return () => unsubscribe();
  }, [postId]);

  const isAdmin = userData?.role === "admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: commentText.trim(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "posts", postId), {
        commentsCount: increment(1),
      });

      setCommentText("");
    } catch (error) {
      console.error("Помилка додавання коментаря:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteDoc(doc(db, "posts", postId, "comments", commentId));

      await updateDoc(doc(db, "posts", postId), {
        commentsCount: increment(-1),
      });
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
      await updateDoc(doc(db, "posts", postId, "comments", editingCommentId), {
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
    <div className="mt-10 max-w-2xl mx-auto p-6 sm:p-8 lg:p-10">
      {comments.length === 0 && (
        <p className="mt-4 text-gray-500">Ще немає коментарів.</p>
      )}

      <div className="mt-6 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 border-b border-black shadow-sm">
            {editingCommentId === comment.id ? (
              <>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={2}
                />
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={handleEditSave}
                    className="text-green-600 text-sm hover:underline"
                  >
                    Зберегти
                  </button>
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="text-gray-500 text-sm hover:underline"
                  >
                    Скасувати
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-800 text-base">{comment.text}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <img
                    src={comment.authorPhotoURL}
                    alt="аватар"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>{comment.authorNickname}</span>
                  <span className="text-xs text-gray-400">
                    •{" "}
                    {comment.createdAt?.toDate?.()
                      ? comment.createdAt.toDate().toLocaleString()
                      : "невідомо"}
                  </span>
                </p>

                {canManageComment(comment) && (
                  <div className="flex gap-4 mt-2 text-sm">
                    <button
                      onClick={() => handleEdit(comment.id, comment.text)}
                      className="h-8 px-5 b border border-black rounded-md hover:bg-black hover:text-white transition"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="h-8 px-5 border border-black rounded-md hover:bg-black hover:text-white transition"
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

      {currentUser && (
        <form onSubmit={handleSubmit} className="mt-20 flex items-start gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Напишіть коментар..."
            className="h-12 flex-1 p-4 bg-gray-100 border border-black rounded-md focus:outline-none focus:ring-0 resize-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`h-12 px-5 border border-black rounded-md px-5 py-2 hover:bg-black hover:text-white transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Надіслати
          </button>
        </form>
      )}
    </div>
  );
};

export default CommentSection;

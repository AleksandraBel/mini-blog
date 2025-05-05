import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/useAuth";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc as firestoreDoc,
} from "firebase/firestore";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("Пост не знайдено");
        }
      } catch (error) {
        console.error("Помилка при отриманні поста:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "posts", id, "comments"),
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
  }, [id]);

  if (loading) return <p>Завантаження...</p>;
  if (!post) return <p>Пост не знайдено.</p>;

  const isAuthor = currentUser && currentUser.uid === post.userId;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addDoc(collection(db, "posts", id, "comments"), {
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

  const handleDeleteComment = async (commentId) => {
    try {
      const commentRef = firestoreDoc(db, "posts", id, "comments", commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Помилка видалення коментаря:", error);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
      <p className="mt-4 text-sm text-gray-500">
        Автор: {post.author || "невідомо"}
      </p>

      {isAuthor && (
        <Link
          to={`/edit/${post.id}`}
          className="inline-block bg-yellow-500 text-white px-4 py-2 rounded mt-6"
        >
          Редагувати
        </Link>
      )}

      {currentUser && (
        <form onSubmit={handleCommentSubmit} className="mt-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Залиште коментар..."
            className="w-full p-2 border rounded"
            rows={3}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Надіслати
          </button>
        </form>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Коментарі</h3>
        {comments.length === 0 && <p>Ще немає коментарів.</p>}
        {comments.map((comment) => {
          const canDelete = currentUser && currentUser.uid === comment.authorId;

          return (
            <div key={comment.id} className="border-b py-2">
              <p className="text-gray-800">{comment.text}</p>
              <p className="text-sm text-gray-500">
                Автор: {comment.authorName} •{" "}
                {comment.createdAt?.toDate().toLocaleString()}
              </p>

              {canDelete && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-red-500 text-sm mt-1"
                >
                  Видалити
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostDetail;

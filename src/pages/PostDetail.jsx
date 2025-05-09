import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/useAuth";
import CommentSection from "../components/CommentSection";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const docRef = doc(db, "posts", id);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("Пост не знайдено");
          setPost(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Помилка при отриманні поста:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  if (loading) return <p>Завантаження...</p>;
  if (!post) return <p>Пост не знайдено.</p>;

  const isAuthor = currentUser && currentUser.uid === post.userId;
  const isAdmin = userData?.role === "admin";

  const handleDelete = async () => {
    const confirm = window.confirm("Ти впевнена, що хочеш видалити пост?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "posts", post.id));
      alert("Пост видалено");
      navigate("/");
    } catch (error) {
      console.error("Помилка видалення:", error);
      alert("Помилка при видаленні поста");
    }
  };

  return (
    <div className="max-w-full mx-auto py-4 sm:py-6">
      <div className="max-w-full sm:max-w-lg md:max-w-screen-md mx-auto px-2 sm:px-4 py-4 sm:py-6 rounded-lg border border-black bg-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">
          {post.content}
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Автор: {post.author || "невідомо"}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Дата:{" "}
          {post.createdAt?.toDate?.()
            ? post.createdAt.toDate().toLocaleDateString()
            : "невідомо"}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Коментарів: {post.commentsCount || 0}
        </p>

        {(isAuthor || isAdmin) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/edit/${post.id}`}
              className="inline-block px-4 py-1 border border-black rounded-md hover:bg-black hover:text-white transition text-sm sm:text-base"
            >
              Редагувати
            </Link>
            <button
              onClick={handleDelete}
              className="inline-block px-4 py-1 border border-black rounded-md hover:bg-black hover:text-white transition text-sm sm:text-base"
            >
              Видалити
            </button>
          </div>
        )}

        <CommentSection postId={post.id} />
      </div>
    </div>
  );
};

export default PostDetail;

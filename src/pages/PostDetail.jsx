import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/useAuth";
import CommentSection from "../components/CommentSection";
import UserBadge from "../components/UserBadge";

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
          const postData = { id: docSnap.id, ...docSnap.data() };
          setPost(postData);
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
    const confirm = window.confirm("Ти впевнений, що хочеш видалити пост?");
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

  const handleToggleLike = async () => {
    if (!currentUser) {
      alert("Увійди, щоб ставити лайк.");
      return;
    }

    const postRef = doc(db, "posts", post.id);
    const isLiked = post.likes?.includes(currentUser.uid);

    try {
      await updateDoc(postRef, {
        likes: isLiked
          ? arrayRemove(currentUser.uid)
          : arrayUnion(currentUser.uid),
      });
    } catch (error) {
      console.error("Помилка при зміні лайка:", error);
    }
  };

  return (
    <div className="max-w-full mx-auto py-4 sm:py-6">
      <div className="max-w-full sm:max-w-lg md:max-w-screen-md mx-auto px-2 sm:px-4 py-4 sm:py-6 rounded-lg border border-black bg-white">
        {/* Автор і дата */}
        <UserBadge
          authorId={post.userId}
          email={post.authorName || "Невідомий автор"}
          date={
            post.createAt?.toDate?.()
              ? post.createAt.toDate().toLocaleString()
              : null
          }
        />
        {/* Зображення статті */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Зображення статті"
            className="mt-4 rounded max-w-full max-h-[400px] object-cover mb-4"
          />
        )}

        {/* Заголовок і контент */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">
          {post.content}
        </p>

        {/* Лайк */}
        <div className="mt-4">
          <button
            onClick={handleToggleLike}
            className="text-xl sm:text-2xl hover:scale-110 transition"
          >
            {post.likes?.includes(currentUser?.uid) ? "❤️" : "🤍"}{" "}
            {post.likes?.length || 0}
          </button>
        </div>

        {/* Метадані */}
        <p className="mt-4 text-sm text-gray-500">
          Коментарів: {post.commentsCount || 0}
        </p>

        {/* Кнопки для автора чи адміна */}
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
      </div>

      <CommentSection postId={post.id} />
    </div>
  );
};

export default PostDetail;

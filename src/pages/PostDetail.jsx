import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/useAuth";
import CommentSection from "../components/CommentSection";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

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

  if (loading) return <p>Завантаження...</p>;
  if (!post) return <p>Пост не знайдено.</p>;

  const isAuthor = currentUser && currentUser.uid === post.userId;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
      <p className="mt-4 text-sm text-gray-500">
        Автор: {post.author || "невідомо"}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Дата:{" "}
        {post.createdAt?.toDate?.()
          ? post.createdAt.toDate().toLocaleDateString()
          : "невідомо"}
      </p>

      {isAuthor && (
        <Link
          to={`/edit/${post.id}`}
          className="inline-block bg-yellow-500 text-white px-4 py-2 rounded mt-6"
        >
          Редагувати
        </Link>
      )}

      {/* Секція коментарів */}
      <CommentSection postId={post.id} />
    </div>
  );
};

export default PostDetail;

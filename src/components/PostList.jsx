import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = collection(db, "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const postsArray = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            commentsCount: 0, // тимчасово 0, оновимо пізніше
          };
        });

        setPosts(postsArray);
      } catch (error) {
        console.error("Помилка при завантаженні постів:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p>Завантаження постів...</p>;

  return (
    <div className="grid gap-4 p-4">
      {posts.map((post) => (
        <Link
          to={`/posts/${post.id}`}
          key={post.id}
          className="border rounded-lg p-4 shadow hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-bold mb-1">{post.title}</h2>
          <p className="text-sm text-gray-500">
            Автор: {post.author || "Невідомо"} |{" "}
            {post.createdAt.toLocaleDateString()} | Коментарів:{" "}
            {post.commentsCount}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default PostsList;

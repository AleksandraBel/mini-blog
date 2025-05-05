import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        const postsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
        <div key={post.id} className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p className="text-gray-600">{post.content.slice(0, 100)}...</p>
          <Link
            to={`/posts/${post.id}`}
            className="text-blue-600 mt-2 inline-block"
          >
            Читати далі
          </Link>
        </div>
      ))}
    </div>
  );
};

export default PostsList;

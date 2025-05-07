import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/useAuth";

const CreateEditPost = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!!id);
  const [ownerId, setOwnerId] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title);
          setContent(data.content);
          setOwnerId(data.userId);

          const isAuthor = currentUser?.uid === data.userId;
          const isAdmin = userData?.role === "admin";

          if (!isAuthor && !isAdmin) {
            setAccessDenied(true);
          }
        } else {
          console.error("Пост не знайдено");
          setAccessDenied(true);
        }
      } catch (error) {
        console.error("Помилка завантаження:", error);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, currentUser, userData]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Заголовок обов'язковий";
    else if (title.length < 5) newErrors.title = "Мінімум 5 символів";

    if (!content.trim()) newErrors.content = "Текст обов'язковий";
    else if (content.length < 20) newErrors.content = "Мінімум 20 символів";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const postData = {
      title,
      content,
      author: currentUser.displayName || currentUser.email,
      updatedAt: serverTimestamp(),
    };

    try {
      if (id) {
        await updateDoc(doc(db, "posts", id), postData);
      } else {
        await addDoc(collection(db, "posts"), {
          ...postData,
          createdAt: serverTimestamp(),
          userId: currentUser.uid,
        });
      }
      navigate("/");
    } catch (error) {
      console.error("Помилка збереження:", error);
    }
  };

  if (loading) return <p>Завантаження...</p>;
  if (accessDenied)
    return <p className="text-red-600 p-4">Доступ заборонено</p>;

  return (
    <form onSubmit={handleSubmit} className="container p-8 space-y-6">
      <h2 className="text-2xl font-semibold mb-6">
        {id ? "Редагування" : "Створити замітку"}
      </h2>

      <div>
        <input
          type="text"
          placeholder="Заголовок"
          className="w-full p-3 mt-2 border border-black rounded-md text-lg bg-white focus:bg-gray-200 focus:outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <textarea
          className="w-full p-3 mt-2 border border-black rounded-md text-lg bg-white focus:bg-gray-200 focus:outline-none"
          placeholder="Текст"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {errors.content && (
          <p className="text-red-600 text-sm mt-1">{errors.content}</p>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="h-12 px-5 border border-black rounded-md hover:bg-black hover:text-white transitionh-12 px-5 border border-black rounded-md hover:bg-black hover:text-white transition"
        >
          {id ? "Зберегти зміни" : "Зберегти"}
        </button>
      </div>
    </form>
  );
};

export default CreateEditPost;

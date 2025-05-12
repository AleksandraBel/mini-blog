import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ProfilePage = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [nickname, setNickname] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNickname(data.nickname || "");
        setPreview(data.profileImageUrl || "");
      }
    };

    fetchUserData();
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profileImageUrl = preview;

      // Якщо є нове зображення, завантажуємо його в Storage
      if (imageFile) {
        const storage = getStorage();
        const fileRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(fileRef, imageFile);
        profileImageUrl = await getDownloadURL(fileRef);
      }

      // Отримуємо поточну дату
      const createdAt = new Date();

      // Зберігаємо в Firestore
      await setDoc(doc(db, "users", user.uid), {
        nickname,
        profileImageUrl,
        role: "user", // можна змінити на необхідну роль (наприклад, "admin" для адміна)
        createdAt: createdAt,
      });

      setPreview(profileImageUrl);
      alert("Профіль оновлено!");
    } catch (err) {
      console.error("Помилка збереження:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Профіль користувача</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Нікнейм"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input type="file" onChange={handleFileChange} />
        {preview && (
          <img
            src={preview}
            alt="Превʼю"
            className="w-32 h-32 rounded-full object-cover"
          />
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Збереження..." : "Зберегти"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;

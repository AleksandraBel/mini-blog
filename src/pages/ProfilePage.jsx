import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { uploadImageToCloudinary } from "../services/uploadImage";

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
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNickname(data.nickname || "");
          setPreview(data.profileImageUrl || "");
        }
      } catch (err) {
        console.error("Помилка завантаження даних:", err);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Користувач не авторизований!");
      return;
    }

    setLoading(true);

    try {
      let profileImageUrl = preview;

      if (imageFile) {
        // Завантажуємо зображення в Cloudinary
        profileImageUrl = await uploadImageToCloudinary(imageFile);
      }

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        nickname,
        profileImageUrl,
      });

      setPreview(profileImageUrl);
      alert("Профіль оновлено!");
    } catch (err) {
      console.error("Помилка збереження:", err);
      alert("Не вдалося оновити профіль. Перевірте консоль.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
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
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <img
            src={preview}
            alt="Превʼю"
            className="w-32 h-32 rounded-full object-cover"
          />
        )}
        <button
          type="submit"
          className="inline-block px-4 py-1 border border-black rounded-md hover:bg-black hover:text-white transition text-sm sm:text-base"
          disabled={loading || !user}
        >
          {loading ? "Збереження..." : "Зберегти"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;

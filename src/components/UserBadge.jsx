// UserBadge.jsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const UserBadge = ({ authorId, email, date, nickname, photoURL }) => {
  const [localNickname, setLocalNickname] = useState("Анонім");
  const [localPhotoURL, setLocalPhotoURL] = useState("/default-avatar.png");

  useEffect(() => {
    if (nickname && photoURL) {
      // Якщо передали готові дані — нічого не вантажимо
      setLocalNickname(nickname);
      setLocalPhotoURL(photoURL);
    } else if (authorId) {
      // Якщо немає даних — вантажимо з Firestore
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", authorId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setLocalNickname(data.nickname || "Анонім");
            setLocalPhotoURL(data.profileImageUrl || "/default-avatar.png");
          }
        } catch (error) {
          console.error("Помилка при завантаженні автора:", error);
        }
      };

      fetchUserData();
    }
  }, [authorId, nickname, photoURL]);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
      <img
        src={localPhotoURL}
        alt="аватар"
        className="w-5 h-5 rounded-full object-cover"
      />
      <span>{localNickname || email}</span>
      {date && <span className="text-xs text-gray-400">• {date}</span>}
    </div>
  );
};

export default UserBadge;

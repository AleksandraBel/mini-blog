import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuth } from "../context/useAuth";
import { db } from "../firebase";

const LikeButton = ({ postId, commentId = null, likes = [] }) => {
  const { currentUser } = useAuth();
  const isLiked = currentUser && likes.includes(currentUser.uid);

  const toggleLike = async () => {
    if (!currentUser) return alert("Увійди, щоб ставити лайки.");

    const ref = commentId
      ? doc(db, "posts", postId, "comments", commentId)
      : doc(db, "posts", postId);

    try {
      await updateDoc(ref, {
        likes: isLiked
          ? arrayRemove(currentUser.uid)
          : arrayUnion(currentUser.uid),
      });
    } catch (error) {
      console.error("Помилка при оновленні лайків:", error);
      alert("Не вдалося оновити лайк.");
    }
  };

  return (
    <button
      onClick={toggleLike}
      className="flex items-center gap-1 hover:scale-110 transition"
    >
      <span>{isLiked ? "❤️" : "🤍"}</span>
      <span className="text-sm text-gray-600">{likes.length}</span>
    </button>
  );
};

export default LikeButton;

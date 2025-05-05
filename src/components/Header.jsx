import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Header = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const logout = auth?.logout;

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="flex justify-between items-center">
        <nav className="flex gap-4">
          <Link to="/">🏠 Home</Link>
          <Link to="/login">🔐 Login</Link>
          <Link to="/register">📝 Register</Link>
          <Link to="/create">➕ Create</Link>
        </nav>

        {currentUser && logout && (
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Вийти
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

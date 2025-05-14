import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Header = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const logout = auth?.logout;

  return (
    <header className="px-4 py-4">
      <div className="max-w-5xl mx-auto bg-white border border-black rounded-md px-4 py-3 flex justify-between items-center">
        <div>
          <Link to="/" className="font-bold text-lg">
            MyBlog
          </Link>
        </div>
        <Link to="/profile">Мій профіль</Link>

        <nav className="flex gap-4 items-center">
          {!currentUser && <Link to="/login">Вхід</Link>}
          {currentUser && (
            <>
              <Link to="/create">Створити</Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="p-2"
              >
                Вийти
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

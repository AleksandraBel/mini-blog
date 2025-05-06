import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Header = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const logout = auth?.logout;

  return (
    <header className="bg-white p-4 border border-black">
      <div className="flex justify-between items-center">
        <nav className="flex gap-4">
          <Link to="/">MyBlog</Link>
          {!currentUser && (
            <>
              <Link to="/login">Вхід</Link>
              <Link to="/register">Реєстрація</Link>
            </>
          )}
          {currentUser && <Link to="/create">Створити</Link>}
        </nav>

        {currentUser && logout && (
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="p-2"
          >
            Вийти
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

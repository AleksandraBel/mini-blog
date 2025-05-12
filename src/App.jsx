import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterForm from "./pages/RegisterForm";
import CreateEditPost from "./pages/CreateEditPost";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import PostDetail from "./pages/PostDetail";
import Unauthorized from "./pages/Unauthorized";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="border-black min-h-screen flex justify-center items-center bg-gray-100">
          <div className="max-w-3xl flex flex-col text-[#1a1a1a] ">
            <Header />
            <main className="flex-grow p-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/create"
                  element={
                    <PrivateRoute allowedRoles={["admin", "user"]}>
                      <CreateEditPost />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/edit/:id"
                  element={
                    <PrivateRoute allowedRoles={["admin", "user"]}>
                      <CreateEditPost />
                    </PrivateRoute>
                  }
                />
                <Route path="/posts/:id" element={<PostDetail />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

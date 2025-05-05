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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/create"
              element={
                <PrivateRoute>
                  <CreateEditPost />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <PrivateRoute>
                  <CreateEditPost />
                </PrivateRoute>
              }
            />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

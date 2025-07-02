import "./App.css";
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { SignupPage } from "./pages/SignupPage.jsx";
import { useAuthStore } from "./store/authStore.js";
import { Loader } from "lucide-react";
import Settings from "./pages/Settings.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth, authUser]);

  if (!authUser && isCheckingAuth)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-20 animate-spin text-amber-600" />
      </div>
    );

  return (
    <>
      <div data-theme={theme}>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignupPage /> : <Navigate to="/" />}
          />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/Profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Routes>
        <Toaster />
      </div>
    </>
  );
};

export default App;

import { Navigate, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import FeedbackPage from "./pages/FeedbackPage";
import GalleryPage from "./pages/GalleryPage";
import HomePage from "./pages/HomePage";
import SmartAacPage from "./pages/SmartAacPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/smart-aac" element={<SmartAacPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

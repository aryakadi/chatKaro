import React from "react";
import { Routes, Route } from "react-router";
import JoinCreateChat from "../components/JoinCreateChat";
import ChatPage from "../components/ChatPage";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<JoinCreateChat />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/about" element={<h1>This is about page</h1>} />
      <Route path="*" element={<h1>404 Page Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;
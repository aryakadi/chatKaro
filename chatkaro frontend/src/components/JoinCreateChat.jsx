import React, { useState } from "react";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({ roomId: "", userName: "" });

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function validateForm() {
    if (!detail.roomId.trim() || !detail.userName.trim()) {
      toast.error("Both name and room ID are required.");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (!validateForm()) return;

    try {
      const room = await joinChatApi(detail.roomId.trim());
      setCurrentUser(detail.userName.trim());
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
      toast.success("Joined room successfully.");
    } catch (error) {
      if (error?.status === 400) {
        toast.error(error?.response?.data || "Invalid room.");
      } else {
        toast.error("Error joining room.");
      }
      console.error(error);
    }
  }

  async function createRoom() {
    if (!validateForm()) return;

    try {
      const response = await createRoomApi(detail.roomId.trim());
      setCurrentUser(detail.userName.trim());
      setRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
      toast.success("Room created and joined successfully.");
    } catch (error) {
      if (error?.status === 400) {
        toast.error("Room already exists.");
      } else {
        toast.error("Error creating room.");
      }
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-300/40 transition-all duration-300 hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/40">
        <div className="mb-6 text-center">
          <img src={chatIcon} alt="Chat" className="mx-auto h-20 w-20" />
          <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">Join or Create a Room</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Start chatting instantly with your team or friends.</p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Your Name
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              value={detail.userName}
              onChange={handleFormInputChange}
              placeholder="Enter your name"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
            />
          </div>

          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Room ID
            </label>
            <input
              id="roomId"
              name="roomId"
              type="text"
              value={detail.roomId}
              onChange={handleFormInputChange}
              placeholder="Enter or create room ID"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={joinChat}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Join Room
            </button>
            <button
              onClick={createRoom}
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
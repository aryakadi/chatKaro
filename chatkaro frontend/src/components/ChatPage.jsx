import React, { useEffect, useRef, useState } from "react";
import { MdSend } from "react-icons/md";
import chatIcon from "../assets/chat.png";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client/dist/sockjs";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();
  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser, navigate]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  const scrollToBottom = (behavior = "smooth") => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    async function loadMessages() {
      try {
        const messageList = await getMessagess(roomId);
        setMessages(messageList);
        setTimeout(() => scrollToBottom("auto"), 100); // initial bottom view
      } catch (error) {
        console.error("Load messages failed", error);
      }
    }
    if (connected) {
      loadMessages();
    }
  }, [connected, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let clientRef = null;

    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);
      clientRef = client;

      client.connect({}, () => {
        setStompClient(client);
        toast.success("WebSocket connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);

          if (newMessage?.content === "WebSocket connected") {
            return;
          }

          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }

    return () => {
      if (clientRef) {
        clientRef.disconnect();
      }
    };
  }, [connected, roomId]);

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input.trim(),
        roomId,
      };

      stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
      setInput("");
      setTimeout(() => scrollToBottom(), 50); // ensure new message is visible
    }
  };

  function handleLogout() {
    if (stompClient) stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  const renderAvatar = (name) => {
    const initials = name
      ? name
          .split(" ")
          .map((part) => part.charAt(0).toUpperCase())
          .slice(0, 2)
          .join("")
      : "U";
    return (
      <div className="h-9 w-9 rounded-full bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center shadow-sm">
        {initials}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white/80 pb-0 backdrop-blur dark:from-slate-900 dark:to-slate-900/95">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={chatIcon} alt="Chat" className="h-10 w-10 rounded-xl shadow-md" />
            <div>
              <p className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Active room</p>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{roomId || "Unknown Room"}</h1>
            </div>
          </div>

          <div className="hidden min-w-[150px] md:block">
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Signed in as</p>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
              <span>{currentUser || "Guest"}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Leave Room
          </button>
        </div>
      </header>

      <main
        ref={chatBoxRef}
        className="mx-auto mt-20 mb-24 h-[calc(100vh-9rem)] max-w-5xl overflow-y-auto px-3 sm:px-6"
      >
        <div className="space-y-3">
          {messages.map((message, index) => {
            const isMine = message.sender === currentUser;
            const bubbleClasses = isMine
              ? "bg-indigo-600 text-white rounded-2xl rounded-br-none border border-indigo-500"
              : "bg-white text-slate-800 rounded-2xl rounded-bl-none border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700";

            return (
              <div key={index} className={`flex ${isMine ? "justify-end" : "justify-start"} px-2`}>
                <div className="flex max-w-[90%] items-end gap-2">
                  {!isMine && renderAvatar(message.sender)}

                  <div className={`${bubbleClasses} p-3 shadow-sm transition-all duration-200 hover:shadow-md`}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm">{message.sender}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-300">{timeAgo(message.timeStamp)}</span>
                    </div>
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                  </div>

                  {isMine && renderAvatar(message.sender)}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            type="text"
            placeholder="Type your message..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            className="rounded-full bg-emerald-500 px-3 py-2 text-white shadow hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            onClick={sendMessage}
            aria-label="Send message"
          >
            <MdSend size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;
import React, { useEffect, useRef, useState } from "react";
import chatIcon from "../assets/chat.png";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client/dist/sockjs";
import { Stomp } from "@stomp/stompjs";
import { toast } from "sonner";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess, getRoomSummary } from "../services/RoomService";
import MessageBubble from "./chat/MessageBubble";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Send, LogOut, MessageSquareDashed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryCount, setSummaryCount] = useState(10);

  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const textareaRef = useRef(null);

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
        setIsLoading(true);
        const messageList = await getMessagess(roomId);
        setMessages(messageList);
        setTimeout(() => scrollToBottom("auto"), 100);
      } catch (error) {
        console.error("Load messages failed", error);
        toast.error("An error occurred while loading messages. Please refresh or try again later.");
      } finally {
        setIsLoading(false);
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
        toast.success("Connected to room");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          if (newMessage?.content === "WebSocket connected") return;
          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }

    return () => {
      if (clientRef) clientRef.disconnect();
    };
  }, [connected, roomId]);

  const sendMessage = () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input.trim(),
        roomId,
      };

      stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      setTimeout(() => scrollToBottom(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  function handleLogout() {
    if (stompClient) stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  const handleSummarize = async () => {
    try {
      setIsSummarizing(true);
      const data = await getRoomSummary(roomId, summaryCount);
      setSummary(data);
    } catch (error) {
      console.error("Failed to generate summary", error);
      const errorMsg = error.response?.data || "An error occurred while generating the summary. The AI service may be unavailable.";
      toast.error(errorMsg);
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!connected) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-50 overflow-hidden">
      {/* Header */}
      <header className="flex-none sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={chatIcon} alt="Chat" className="h-9 w-9 rounded-xl shadow-md" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-100 leading-tight">{roomId}</h1>
              <p className="text-xs text-slate-400 leading-tight">Active Room</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <select 
                value={summaryCount} 
                onChange={(e) => setSummaryCount(Number(e.target.value))}
                className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1 outline-none h-8 cursor-pointer"
              >
                <option value={10}>Last 10</option>
                <option value={20}>Last 20</option>
                <option value={30}>Last 30</option>
                <option value={40}>Last 40</option>
                <option value={50}>Last 50</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="text-indigo-400 border-indigo-900/30 hover:bg-indigo-500/10 hover:text-indigo-300 h-8 text-xs px-3"
              >
                {isSummarizing ? "Summarizing..." : "Summarize"}
              </Button>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-4 ml-1">
              <span className="text-xs text-slate-400">Signed in as</span>
              <span className="text-sm font-medium text-indigo-300">{currentUser}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-400 border-red-900/30 hover:bg-red-500/10 hover:text-red-300 h-9"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto scroll-smooth p-4 sm:px-6 w-full max-w-5xl mx-auto custom-scrollbar"
      >
        <div className="flex flex-col gap-4 py-4 min-h-full justify-end">
          {isLoading ? (
            <div className="space-y-6 w-full">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`flex w-full ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <div className={`flex gap-3 max-w-[70%] ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                    <Skeleton className="w-8 h-8 rounded-full shrink-0 bg-slate-800" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20 bg-slate-800" />
                      <Skeleton className={`h-16 rounded-2xl bg-slate-800/50 ${i % 2 === 0 ? 'w-48' : 'w-64'}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-80 py-20">
              <MessageSquareDashed className="w-16 h-16 mb-4 text-slate-700" />
              <h3 className="text-lg font-medium text-slate-300">No messages yet</h3>
              <p className="text-sm">Be the first to say hello!</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageBubble message={message} isMine={message.sender === currentUser} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Composer Area */}
      <footer className="flex-none p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800/60 z-30">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-end gap-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-2 pl-4 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Message #room..."
              rows={1}
              className="w-full max-h-[200px] min-h-[24px] bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none py-2.5 custom-scrollbar"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim()}
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:bg-slate-800 disabled:text-slate-500 transition-colors"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">
              <strong>Enter</strong> to send &bull; <strong>Shift + Enter</strong> for new line
            </span>
          </div>
        </div>
      </footer>

      {/* Summary Loading Modal */}
      <AnimatePresence>
        {isSummarizing && !summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden flex flex-col items-center justify-center p-8 gap-4"
            >
              <div className="relative flex h-14 w-14 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-20"></span>
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  <span className="text-xl">✨</span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-slate-200">Generating AI Summary...</h3>
              <p className="text-xs text-slate-400 text-center">Analyzing the last {summaryCount} messages</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Result Modal */}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <span className="text-indigo-400">✨</span> AI Summary ({summaryCount} messages)
                </h3>
                <button 
                  onClick={() => setSummary(null)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
              <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                <Button onClick={() => setSummary(null)} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
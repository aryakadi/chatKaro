import { createContext, useContext, useState, useEffect } from "react";

const ChatContext = createContext();

const useSessionStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export const ChatProvider = ({ children }) => {
  const [roomId, setRoomId] = useSessionStorage("chat_roomId", "");
  const [currentUser, setCurrentUser] = useSessionStorage("chat_currentUser", "");
  const [connected, setConnected] = useSessionStorage("chat_connected", false);

  return (
    <ChatContext.Provider
      value={{
        roomId,
        currentUser,
        connected,
        setRoomId,
        setCurrentUser,
        setConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const useChatContext = () => useContext(ChatContext);
export default useChatContext;
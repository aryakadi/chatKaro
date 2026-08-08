import React from "react";
import chatIcon from "../assets/chat.png";
import { toast } from "sonner";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { MessageSquarePlus, LogIn } from "lucide-react";

const formSchema = z.object({
  userName: z.string().min(2, "Name must be at least 2 characters"),
  roomId: z.string().min(3, "Room ID must be at least 3 characters"),
});

const JoinCreateChat = () => {
  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      roomId: "",
    },
  });

  const onJoin = async (data) => {
    try {
      const room = await joinChatApi(data.roomId.trim());
      setCurrentUser(data.userName.trim());
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
      toast.success("Joined room successfully.");
    } catch (error) {
      if (error?.status === 400) {
        toast.error(error?.response?.data || "An error occurred: Invalid room.");
      } else {
        toast.error("An error occurred while attempting to join the room. Please try again.");
      }
      console.error(error);
    }
  };

  const onCreate = async (data) => {
    try {
      const response = await createRoomApi(data.roomId.trim());
      setCurrentUser(data.userName.trim());
      setRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
      toast.success("Room created and joined successfully.");
    } catch (error) {
      if (error?.status === 400) {
        toast.error("The specified room already exists. Please choose a different identifier.");
      } else {
        toast.error("An error occurred while attempting to create the room. Please try again.");
      }
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-4 pt-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto bg-indigo-500/10 p-4 rounded-2xl w-fit"
            >
              <img src={chatIcon} alt="Chat" className="h-16 w-16 drop-shadow-lg" />
            </motion.div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight text-slate-50">Welcome to ChatKaro</CardTitle>
              <CardDescription className="text-slate-400 text-base">
                Join an existing room or create a new one to start chatting instantly.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Your Name</label>
                <Input
                  {...register("userName")}
                  placeholder="Enter your name"
                  className="bg-slate-950/50 border-slate-700/50 focus-visible:ring-indigo-500/50 h-12"
                />
                {errors.userName && (
                  <p className="text-red-400 text-sm ml-1">{errors.userName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Room ID</label>
                <Input
                  {...register("roomId")}
                  placeholder="Enter or create room ID"
                  className="bg-slate-950/50 border-slate-700/50 focus-visible:ring-indigo-500/50 h-12"
                />
                {errors.roomId && (
                  <p className="text-red-400 text-sm ml-1">{errors.roomId.message}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={handleSubmit(onJoin)}
                  disabled={isSubmitting}
                  className="flex-1 h-12 text-base font-semibold shadow-indigo-500/25"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Join Room
                </Button>
                <Button 
                  onClick={handleSubmit(onCreate)}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1 h-12 text-base font-semibold bg-transparent border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200"
                >
                  <MessageSquarePlus className="w-5 h-5 mr-2" />
                  Create Room
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default JoinCreateChat;
package com.chatapp.chatappbackend.controllers;

import com.chatapp.chatappbackend.config.AppConstants;
import com.chatapp.chatappbackend.entities.Message;
import com.chatapp.chatappbackend.entities.Room;
import com.chatapp.chatappbackend.payload.MessageRequest;
import com.chatapp.chatappbackend.repositories.RoomRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;

@Controller
@CrossOrigin(origins = "*")
public class ChatController {

    private RoomRepository roomRepository;

    public ChatController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest request) {

        Room room = roomRepository.findByRoomId(request.getRoomId());
        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());
        if (room != null) {
            room.getMessages().add(message);
            roomRepository.save(room);
        } else {
            throw new RuntimeException("room not found !!");
        }

        return message;

    }
}

// WebSocket controller that receives messages from clients via @MessageMapping
// (e.g., /app/sendMessage/{roomId}),
// processes and saves them to the database, and uses @SendTo to broadcast the
// message to all subscribers
// of a topic (e.g., /topic/room/{roomId}) — no HTTP request/response or view
// rendering involved
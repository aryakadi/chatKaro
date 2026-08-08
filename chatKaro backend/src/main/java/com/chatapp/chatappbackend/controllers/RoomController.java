package com.chatapp.chatappbackend.controllers;

import com.chatapp.chatappbackend.entities.Message;
import com.chatapp.chatappbackend.entities.Room;
import com.chatapp.chatappbackend.repositories.RoomRepository;
import com.chatapp.chatappbackend.services.ChatSummaryService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin(origins = "*")
public class RoomController {
    private static final Logger logger = LoggerFactory.getLogger(RoomController.class);

    private final RoomRepository roomRepository;
    private final ChatSummaryService chatSummaryService;

    public RoomController(RoomRepository roomRepository, ChatSummaryService chatSummaryService) {
        this.roomRepository = roomRepository;
        this.chatSummaryService = chatSummaryService;
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId) {
        if (roomRepository.findByRoomId(roomId) != null) {
            // room is already there
            return ResponseEntity.badRequest().body("Room already exists!");

        }

        // create new room
        Room room = new Room();
        room.setRoomId(roomId);
        Room savedRoom = roomRepository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);

    }

    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(
            @PathVariable String roomId) {

        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest()
                    .body("Room not found!!");
        }
        return ResponseEntity.ok(room);
    }
    // get messages of room

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "20", required = false) int size) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().build();
        }
        // get messages :
        // pagination
        List<Message> messages = room.getMessages();
        int start = Math.max(0, messages.size() - (page + 1) * size);
        int end = Math.min(messages.size(), start + size);
        // Latest messages first (reverse pagination)
        List<Message> paginatedMessages = messages.subList(start, end);
        return ResponseEntity.ok(paginatedMessages);

    }

    @GetMapping("/{roomId}/summary")
    public ResponseEntity<String> getRoomSummary(
            @PathVariable String roomId,
            @RequestParam(value = "count", defaultValue = "50") int count) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().body("Room not found!!");
        }
        
        List<Message> messages = room.getMessages();
        
        if (messages == null || messages.isEmpty()) {
            return ResponseEntity.badRequest().body("Not enough messages to summarize. The room is empty.");
        }
        
        if (messages.size() < 3) {
            return ResponseEntity.badRequest().body("Only " + messages.size() + " messages exist. Need at least 3 messages to generate a meaningful summary.");
        }

        int start = Math.max(0, messages.size() - count);
        List<Message> recentMessages = messages.subList(start, messages.size());
        
        try {
            String summary = chatSummaryService.summarizeMessages(recentMessages);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Error generating summary:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("AI service is temporarily unavailable or API key is invalid. Error: " + e.getMessage());
        }
    }

}

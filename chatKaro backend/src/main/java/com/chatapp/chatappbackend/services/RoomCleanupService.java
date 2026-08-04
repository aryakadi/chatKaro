package com.chatapp.chatappbackend.services;

import com.chatapp.chatappbackend.entities.Message;
import com.chatapp.chatappbackend.entities.Room;
import com.chatapp.chatappbackend.repositories.RoomRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoomCleanupService {

    private final RoomRepository roomRepository;

    public RoomCleanupService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // Run every hour (3600000 ms)
    @Scheduled(fixedRate = 3600000)
    public void cleanupInactiveRooms() {
        System.out.println("Running inactive room cleanup task...");
        List<Room> allRooms = roomRepository.findAll();
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);
        int deletedCount = 0;

        for (Room room : allRooms) {
            boolean shouldDelete = false;

            if (room.getMessages() == null || room.getMessages().isEmpty()) {
                // If there are no messages, check creation time. If missing (old db records), assume old and delete.
                if (room.getCreatedAt() == null || room.getCreatedAt().isBefore(threshold)) {
                    shouldDelete = true;
                }
            } else {
                // Check the last message's timestamp
                Message lastMessage = room.getMessages().get(room.getMessages().size() - 1);
                if (lastMessage.getTimeStamp() != null && lastMessage.getTimeStamp().isBefore(threshold)) {
                    shouldDelete = true;
                }
            }

            if (shouldDelete) {
                roomRepository.delete(room);
                deletedCount++;
                System.out.println("Deleted inactive room: " + room.getRoomId());
            }
        }
        
        System.out.println("Cleanup complete. Deleted " + deletedCount + " rooms.");
    }
}

package com.chatapp.chatappbackend.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "rooms")
// MongoDB will create:
//rooms (collection)
// Each object = one document

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    private  String id; //for mongodb:key
    private  String roomId;

    private List<Message> messages= new ArrayList<>();
}

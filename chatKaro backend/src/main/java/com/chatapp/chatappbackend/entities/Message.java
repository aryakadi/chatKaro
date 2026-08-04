package com.chatapp.chatappbackend.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    private  String sender;
    private String content;
    private LocalDateTime timeStamp;

    public Message(String content, String sender) {
        this.content = content;
        this.sender = sender;
    }
}

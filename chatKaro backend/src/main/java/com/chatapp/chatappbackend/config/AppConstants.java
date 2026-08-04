package com.chatapp.chatappbackend.config;registry.addEndpoint("/chat").setAllowedOriginPatterns("*") // Allows Vercel frontend URL dynamically
.withSockJS();

public class AppConstants {
    public static final String FRONTEND_BASE_BASE_URL = "http://localhost:5173";
}

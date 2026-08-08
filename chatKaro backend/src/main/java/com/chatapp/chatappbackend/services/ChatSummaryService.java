package com.chatapp.chatappbackend.services;

import com.chatapp.chatappbackend.entities.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatSummaryService {

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String summarizeMessages(List<Message> messages) {
        if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiApiKey.contains("your_gemini")) {
            throw new RuntimeException("Gemini API Key is not configured in application.properties or .env");
        }

        String conversation = messages.stream()
                .map(msg -> msg.getSender() + ": " + msg.getContent())
                .collect(Collectors.joining("\n"));

        String prompt = "You are an AI assistant specializing in summarizing chat conversations.\n" +
                "Generate a concise summary.\n" +
                "Return:\n" +
                "## Main Topic\n" +
                "## Important Points\n" +
                "## Decisions Made\n" +
                "## Action Items\n" +
                "## Open Questions\n\n" +
                "Ignore greetings, emojis, and small talk.\n" +
                "Do not invent facts.\n" +
                "Limit the response to 150 words.\n\n" +
                "Conversation:\n" + conversation;

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                + geminiApiKey;
        // Construct JSON payload
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)))));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

        if (response.getBody() != null && response.getBody().containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            if (!candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (!parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
        }
        throw new RuntimeException("Failed to generate summary from Gemini API");
    }
}

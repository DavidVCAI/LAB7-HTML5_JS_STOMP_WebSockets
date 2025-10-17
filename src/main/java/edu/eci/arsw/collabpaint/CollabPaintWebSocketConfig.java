package edu.eci.arsw.collabpaint;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for collaborative painting application.
 * Configures STOMP messaging protocol over WebSockets with SockJS fallback.
 *
 * @author Jesús Pinzón & David Velásquez
 * @version 1.0
 * @since 2025-10-17
 */
@Configuration
@EnableWebSocketMessageBroker
public class CollabPaintWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configures the message broker for handling messages.
     * Sets up a simple in-memory broker for /topic destinations.
     * 
     * @param config the message broker registry configuration
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker to carry messages back to clients
        // on destinations prefixed with "/topic"
        config.enableSimpleBroker("/topic");
        
        // Designate the "/app" prefix for messages bound for @MessageMapping-annotated methods
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Registers STOMP endpoints for WebSocket connections.
     * Configures SockJS fallback options for browsers that don't support WebSocket.
     * 
     * @param registry the STOMP endpoint registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/stompendpoint" endpoint with SockJS fallback
        registry.addEndpoint("/stompendpoint").withSockJS();
    }
}

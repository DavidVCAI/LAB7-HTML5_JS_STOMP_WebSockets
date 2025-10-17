package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * STOMP message handler for collaborative drawing operations.
 * Intercepts point events and manages polygon creation when sufficient points are received.
 * Handles multiple concurrent drawings using thread-safe collections.
 *
 * @author Jesús Pinzón & David Velásquez
 * @version 1.0
 * @since 2025-10-17
 */
@Controller
public class STOMPMessagesHandler {

    /**
     * Template for sending messages to STOMP destinations.
     */
    @Autowired
    private SimpMessagingTemplate msgt;

    /**
     * Thread-safe storage for points of each drawing.
     * Key: drawingId, Value: List of points for that drawing
     */
    private final ConcurrentHashMap<String, List<Point>> drawingPoints = new ConcurrentHashMap<>();

    /**
     * Maximum number of points before creating a polygon.
     */
    private static final int POLYGON_POINT_THRESHOLD = 4;

    /**
     * Handles incoming point events from clients.
     * Stores points and publishes polygons when threshold is reached.
     *
     * @param pt the received point
     * @param numdibujo the drawing identifier
     * @throws Exception if an error occurs during message handling
     */
    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("New point received on server for drawing " + numdibujo + ": " + pt);

        // Step 1: Forward the point to all clients subscribed to /topic/newpoint.{numdibujo}
        msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);

        // Step 2: Store the point for polygon creation (thread-safe)
        // computeIfAbsent is atomic - ensures thread-safe initialization
        List<Point> points = drawingPoints.computeIfAbsent(
            numdibujo,
            k -> new CopyOnWriteArrayList<>()
        );

        // Add point to the list (CopyOnWriteArrayList is thread-safe)
        points.add(pt);

        System.out.println("Drawing " + numdibujo + " now has " + points.size() + " points");

        // Step 3: Check if we have enough points to create a polygon
        if (points.size() >= POLYGON_POINT_THRESHOLD) {
            // Create polygon with current points
            Polygon polygon = new Polygon(List.copyOf(points));

            System.out.println("Polygon complete for drawing " + numdibujo + "! Publishing...");

            // Publish polygon to /topic/newpolygon.{numdibujo}
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);

            // Reset points for this drawing to start a new polygon
            points.clear();
            System.out.println("Points reset for drawing " + numdibujo);
        }
    }

    /**
     * Gets the current point count for a specific drawing.
     * Useful for debugging and monitoring.
     *
     * @param drawingId the drawing identifier
     * @return the number of points currently stored for the drawing
     */
    public int getPointCount(String drawingId) {
        List<Point> points = drawingPoints.get(drawingId);
        return points != null ? points.size() : 0;
    }
}

package edu.eci.arsw.collabpaint.model;

import java.util.List;

/**
 * Represents a polygon composed of multiple points.
 * This class is used to transmit completed polygons through WebSocket connections.
 *
 * @author Jesús Pinzón & David Velásquez
 * @version 1.0
 * @since 2025-10-17
 */
public class Polygon {

    private List<Point> points;

    /**
     * Default constructor required for JSON deserialization.
     */
    public Polygon() {
    }

    /**
     * Constructs a Polygon with a list of points.
     *
     * @param points the list of points forming the polygon
     */
    public Polygon(List<Point> points) {
        this.points = points;
    }

    /**
     * Gets the list of points forming the polygon.
     *
     * @return the list of points
     */
    public List<Point> getPoints() {
        return points;
    }

    /**
     * Sets the list of points forming the polygon.
     *
     * @param points the list of points to set
     */
    public void setPoints(List<Point> points) {
        this.points = points;
    }

    @Override
    public String toString() {
        return "Polygon{" + "points=" + points + '}';
    }
}

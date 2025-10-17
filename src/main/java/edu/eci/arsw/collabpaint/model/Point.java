package edu.eci.arsw.collabpaint.model;

/**
 * Represents a point with x and y coordinates in a 2D plane.
 * This class is used to transmit drawing coordinates through WebSocket connections.
 *
 * @author Jesús Pinzón & David Velásquez
 * @version 1.0
 * @since 2025-10-17
 */
public class Point {
    
    private int x;
    private int y;

    /**
     * Default constructor required for JSON deserialization.
     */
    public Point() {
    }

    /**
     * Constructs a Point with specified coordinates.
     * 
     * @param x the x coordinate
     * @param y the y coordinate
     */
    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Gets the x coordinate.
     * 
     * @return the x coordinate
     */
    public int getX() {
        return x;
    }

    /**
     * Sets the x coordinate.
     * 
     * @param x the x coordinate to set
     */
    public void setX(int x) {
        this.x = x;
    }

    /**
     * Gets the y coordinate.
     * 
     * @return the y coordinate
     */
    public int getY() {
        return y;
    }

    /**
     * Sets the y coordinate.
     * 
     * @param y the y coordinate to set
     */
    public void setY(int y) {
        this.y = y;
    }

    @Override
    public String toString() {
        return "Point{" + "x=" + x + ", y=" + y + '}';
    }
}

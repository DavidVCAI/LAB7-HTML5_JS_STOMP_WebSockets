/**
 * Collaborative Paint Application - Client Side
 * Implements real-time collaborative drawing using WebSockets and STOMP protocol.
 *
 * @author Jesús Pinzón & David Velásquez
 * @version 1.0
 * @since 2025-10-17
 */
var app = (function () {

    /**
     * Point class representing a coordinate in the canvas.
     */
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    /**
     * STOMP client instance for WebSocket communication.
     * @private
     */
    var stompClient = null;

    /**
     * Draws a point on the canvas as a small circle.
     *
     * @param {Point} point - The point to draw with x and y coordinates
     */
    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        // Draw a circle with radius 3 at the point coordinates
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.stroke();
    };

    /**
     * Gets the mouse position relative to the canvas.
     *
     * @param {Event} evt - The mouse event
     * @returns {Object} Object with x and y coordinates
     */
    var getMousePosition = function (evt) {
        var canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    /**
     * Establishes WebSocket connection and subscribes to the newpoint topic.
     * Sets up STOMP over SockJS for real-time message handling.
     */
    var connectAndSubscribe = function () {
        console.info('Connecting to WebSocket...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        // Connect to WebSocket server
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);

            // Subscribe to /topic/newpoint to receive point events from other clients
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                console.log('Received point event:', eventbody.body);

                // Parse the received point and draw it on canvas
                var theObject = JSON.parse(eventbody.body);
                addPointToCanvas(theObject);

                // Show alert with received coordinates (Part I requirement)
                alert('Point received - X: ' + theObject.x + ', Y: ' + theObject.y);
            });
        });
    };

    return {
        /**
         * Initializes the application.
         * Sets up WebSocket connection when page loads.
         */
        init: function () {
            var canvas = document.getElementById("canvas");
            console.log("Initializing Collaborative Paint Application...");

            // Establish WebSocket connection
            connectAndSubscribe();
        },

        /**
         * Publishes a point to all connected clients via WebSocket.
         * Draws the point locally and broadcasts it through STOMP.
         *
         * @param {number} px - X coordinate
         * @param {number} py - Y coordinate
         */
        publishPoint: function (px, py) {
            var pt = new Point(px, py);
            console.info("Publishing point at " + pt);

            // Draw point on local canvas
            addPointToCanvas(pt);

            // Publish the point to /topic/newpoint so all subscribers receive it
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
        },

        /**
         * Disconnects from the WebSocket server.
         */
        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected from WebSocket");
        }
    };

})();

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
     * Current drawing identifier.
     * @private
     */
    var currentDrawingId = null;

    /**
     * Flag indicating if currently connected to WebSocket.
     * @private
     */
    var isConnected = false;

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
     * Draws a filled polygon on the canvas.
     *
     * @param {Polygon} polygon - Object with points array property
     */
    var addPolygonToCanvas = function (polygon) {
        if (!polygon || !polygon.points || polygon.points.length < 3) {
            console.warn('Invalid polygon received:', polygon);
            return;
        }

        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        console.log('Drawing polygon with ' + polygon.points.length + ' points');

        // Begin path for polygon
        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);

        // Draw lines to each subsequent point
        for (var i = 1; i < polygon.points.length; i++) {
            ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
        }

        // Close the polygon path
        ctx.closePath();

        // Fill the polygon with semi-transparent color
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Red with 30% opacity
        ctx.fill();

        // Draw border
        ctx.strokeStyle = '#ff0000'; // Red border
        ctx.lineWidth = 2;
        ctx.stroke();

        console.log('Polygon drawn successfully');
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
     * Sets up mouse event handlers on the canvas for interactive drawing.
     * Captures clicks and publishes points to the current drawing topic.
     */
    var setupCanvasEvents = function () {
        var canvas = document.getElementById("canvas");

        // Add click event listener
        canvas.addEventListener('click', function (event) {
            if (!isConnected || currentDrawingId === null) {
                alert('Please connect to a drawing first!');
                return;
            }

            // Get mouse position relative to canvas
            var position = getMousePosition(event);
            var pt = new Point(Math.round(position.x), Math.round(position.y));

            console.info("Publishing point to drawing " + currentDrawingId + ": " + JSON.stringify(pt));

            // Draw point on local canvas immediately
            addPointToCanvas(pt);

            // Publish to dynamic topic: /topic/newpoint.{drawingId}
            var appDestination = '/app/newpoint.' + currentDrawingId;
            stompClient.send(appDestination, {}, JSON.stringify(pt));
        });

        // Add pointer event for better cross-platform support
        canvas.addEventListener('pointerdown', function (event) {
            if (!isConnected || currentDrawingId === null) {
                return;
            }

            event.preventDefault();

            var position = getMousePosition(event);
            var pt = new Point(Math.round(position.x), Math.round(position.y));

            console.info("Publishing point (pointer) to drawing " + currentDrawingId + ": " + JSON.stringify(pt));

            addPointToCanvas(pt);
            var appDestination = '/app/newpoint.' + currentDrawingId;
            stompClient.send(appDestination, {}, JSON.stringify(pt));
        });
    };

    /**
     * Updates the UI elements based on connection state.
     *
     * @param {boolean} connected - True if connected, false otherwise
     */
    var updateConnectionUI = function (connected) {
        var connectBtn = document.getElementById('connectBtn');
        var disconnectBtn = document.getElementById('disconnectBtn');
        var drawingIdInput = document.getElementById('drawingId');
        var statusIndicator = document.getElementById('statusIndicator');
        var currentDrawingDisplay = document.getElementById('currentDrawing');

        if (connected) {
            connectBtn.disabled = true;
            disconnectBtn.disabled = false;
            drawingIdInput.disabled = true;
            statusIndicator.className = 'status-indicator connected';
            statusIndicator.textContent = 'Connected';
            currentDrawingDisplay.textContent = 'Drawing #' + currentDrawingId;
        } else {
            connectBtn.disabled = false;
            disconnectBtn.disabled = true;
            drawingIdInput.disabled = false;
            statusIndicator.className = 'status-indicator disconnected';
            statusIndicator.textContent = 'Disconnected';
            currentDrawingDisplay.textContent = 'Not connected';
        }
    };

    /**
     * Clears the canvas completely.
     */
    var clearCanvas = function () {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    /**
     * Establishes WebSocket connection and subscribes to a specific drawing topic.
     * Uses dynamic topic names based on drawing identifier.
     *
     * @param {string} drawingId - The drawing identifier to subscribe to
     */
    var connectAndSubscribe = function (drawingId) {
        console.info('Connecting to WebSocket for drawing: ' + drawingId);

        if (stompClient !== null && isConnected) {
            console.warn('Already connected. Disconnect first.');
            return;
        }

        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        // Connect to WebSocket server
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            isConnected = true;
            currentDrawingId = drawingId;

            // Update UI to show connected state
            updateConnectionUI(true);

            // Subscribe to dynamic topic: /topic/newpoint.{drawingId}
            var topic = '/topic/newpoint.' + drawingId;
            console.log('Subscribing to topic: ' + topic);

            stompClient.subscribe(topic, function (eventbody) {
                console.log('Received point event on ' + topic + ':', eventbody.body);

                // Parse the received point and draw it on canvas
                var theObject = JSON.parse(eventbody.body);
                addPointToCanvas(theObject);
            });

            // Subscribe to dynamic topic: /topic/newpoint.{drawingId}
            var topic = '/topic/newpoint.' + drawingId;
            console.log('Subscribing to topic: ' + topic);

            stompClient.subscribe(topic, function (eventbody) {
                console.log('Received point event on ' + topic + ':', eventbody.body);

                // Parse the received point and draw it on canvas
                var theObject = JSON.parse(eventbody.body);
                addPointToCanvas(theObject);
            });

            // AGREGAR ESTO: Subscribe to polygon topic
            var polygonTopic = '/topic/newpolygon.' + drawingId;
            console.log('Subscribing to polygon topic: ' + polygonTopic);

            stompClient.subscribe(polygonTopic, function (eventbody) {
                console.log('Received polygon event on ' + polygonTopic + ':', eventbody.body);

                // Parse the received polygon and draw it on canvas
                var polygon = JSON.parse(eventbody.body);
                addPolygonToCanvas(polygon);
            });

            console.log('Successfully subscribed to drawing: ' + drawingId);
        }, function(error) {
            console.error('WebSocket connection error:', error);
            isConnected = false;
            updateConnectionUI(false);
            alert('Failed to connect to WebSocket. Please try again.');
        });
    };

    return {
        /**
         * Initializes the application.
         * Sets up canvas event handlers (connection is manual now).
         */
        init: function () {
            console.log("Initializing Collaborative Paint Application - Part III...");

            // Setup canvas mouse/pointer events
            setupCanvasEvents();

            // Initialize UI state
            updateConnectionUI(false);
        },

        /**
         * Connects to a specific drawing by its identifier.
         * Must be called before drawing can begin.
         *
         * @param {string} drawingId - The drawing identifier to connect to
         */
        connect: function (drawingId) {
            if (!drawingId || drawingId.trim() === '') {
                alert('Please enter a drawing number!');
                return;
            }

            if (isConnected) {
                alert('Already connected to drawing ' + currentDrawingId + '. Disconnect first.');
                return;
            }

            // Clear canvas when connecting to new drawing
            clearCanvas();

            // Connect and subscribe to the specified drawing topic
            connectAndSubscribe(drawingId.trim());
        },

        /**
         * Publishes a point to the current drawing topic.
         *
         * @param {number} px - X coordinate
         * @param {number} py - Y coordinate
         */
        publishPoint: function (px, py) {
            if (!isConnected || currentDrawingId === null) {
                alert('Not connected to any drawing. Please connect first.');
                return;
            }

            var pt = new Point(parseInt(px), parseInt(py));
            console.info("Publishing point to drawing " + currentDrawingId + ": " + JSON.stringify(pt));

            // Draw point on local canvas
            addPointToCanvas(pt);

            // Publish to dynamic topic
            var appDestination = '/app/newpoint.' + currentDrawingId;
            stompClient.send(appDestination, {}, JSON.stringify(pt));
        },

        /**
         * Disconnects from the current WebSocket connection.
         */
        disconnect: function () {
            if (stompClient !== null && isConnected) {
                stompClient.disconnect(function() {
                    console.log("Disconnected from drawing: " + currentDrawingId);
                });
                isConnected = false;
                currentDrawingId = null;
                updateConnectionUI(false);
                clearCanvas();
            }
        }
    };

})();

"use strict";
// Create a WebSocket connection to the server
const socket = new WebSocket('ws://localhost:3000');
// Set the WebSocket's binary type to ArrayBuffer to handle binary data
socket.binaryType = 'arraybuffer';
// Get references to the HTML elements for the increment button and the counter display
const incrementButton = document.getElementById('incrementButton');
const counterDisplay = document.getElementById('counter');
// Create an ArrayBuffer to hold 8 bytes (2 Float32 values, 4 bytes each)
const buffer = new ArrayBuffer(8);
const view = new Float32Array(buffer); // A Float32Array view to easily manipulate the buffer as floats
let isSocketOpen = false; // A flag to track whether the WebSocket connection is open
// Add an event listener to the increment button to send data when clicked
incrementButton.addEventListener('click', () => {
    // Set the first and second values in the Float32Array (buffer)
    view[0] = 1.1234;
    view[1] = 2.9873;
    // Only send the buffer if the WebSocket is open
    if (isSocketOpen) {
        socket.send(buffer); // Send the ArrayBuffer containing the float values to the server
    }
    else {
        console.log('WebSocket is not open yet'); // Log a message if the WebSocket is not open
    }
});
// Handle incoming messages from the WebSocket server
socket.onmessage = (event) => {
    const data = event.data; // Get the data from the event
    // Check if the data is an ArrayBuffer (binary data)
    if (data instanceof ArrayBuffer) {
        // Create a DataView to read from the received ArrayBuffer
        const dataView = new DataView(data);
        // Read two float values from the ArrayBuffer (little endian format)
        const float1 = dataView.getFloat32(0, true); // Read the first float (x-coordinate)
        const float2 = dataView.getFloat32(4, true); // Read the second float (y-coordinate)
        // Update the display with the received coordinates
        counterDisplay.textContent = `Cord: ${float1}, ${float2}`;
    }
    else {
        console.log('Received non-binary message:', data); // Log if the received data is not binary
    }
};
// Handle the WebSocket connection open event
socket.onopen = () => {
    console.log('Connected to WebSocket server'); // Log a message when the connection is established
    isSocketOpen = true; // Mark the WebSocket as open, allowing data to be sent
};
// Handle the WebSocket connection close event
socket.onclose = () => {
    console.log('Disconnected from WebSocket server'); // Log a message when the connection is closed
    isSocketOpen = false; // Mark the WebSocket as closed
};
// Handle WebSocket errors (if any)
socket.onerror = (error) => {
    console.error('WebSocket error:', error); // Log the error message
};

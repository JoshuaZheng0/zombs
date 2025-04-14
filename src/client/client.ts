const socket = new WebSocket('ws://localhost:3000');
const incrementButton = document.getElementById('incrementButton') as HTMLButtonElement;
const counterDisplay = document.getElementById('counter') as HTMLDivElement;

let isSocketOpen = false; // To track whether the WebSocket is open

// Ensure the WebSocket is open before sending the message
incrementButton.addEventListener('click', () => {
  console.log('clicked');
  if (isSocketOpen) {
    socket.send('increment');
  } else {
    console.log('WebSocket is not open yet');
  }
});

// Listen for server messages (updated counter)
socket.onmessage = (event: MessageEvent) => {
  const updatedCounter = event.data;
  counterDisplay.textContent = `Counter: ${updatedCounter}`;
};

// Handle any errors with WebSocket
socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Handle WebSocket connection open
socket.onopen = () => {
  console.log('Connected to WebSocket server');
  isSocketOpen = true;  // Mark the WebSocket as open
};

// Handle WebSocket close
socket.onclose = () => {
  console.log('Disconnected from WebSocket server');
  isSocketOpen = false;  // Mark the WebSocket as closed
};

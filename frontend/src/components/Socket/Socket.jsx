import { io } from "socket.io-client";

// Since your React frontend is now served by the same Express server,
// you can omit the URL or use relative paths
const socket = io(); // Automatically connects to the origin where the page is served

export default socket;

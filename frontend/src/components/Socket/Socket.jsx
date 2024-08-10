import { io } from "socket.io-client";

const URL = "http://localhost:3000"; // Update with your backend URL if different
const socket = io(URL);

export default socket;

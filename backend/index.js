const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/msg");
const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const redis = require("redis");
require("dotenv").config();
const { createClient } = redis;
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "frontend", "public")));

const botName = "ChatCord Bot";

// Redis adapter setup
(async () => {
  try {
    const client = createClient({ url: 'redis://localhost:6379' });
    await client.connect();
    const pong = await client.ping();
    console.log(pong); // Should log 'PONG'
    await client.quit();
  } catch (error) {
    console.error('Redis connection error:', error);
  }
})();



io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on("joinRoom", ({ username, room }) => {
    console.log(`User ${username} joining room ${room}`);
    
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome the current user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    console.log(`Users in room ${room}:`, getRoomUsers(user.room));
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    if (!user) {
      console.log(`No user found for socket ${socket.id}`);
      return;
    }
    console.log(`Message from ${user.username} in room ${user.room}: ${msg}`);
    
    const formattedMessage = formatMessage(user.username, msg);
    io.to(user.room).emit("message", formattedMessage);
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    console.log(`Disconnection: ${socket.id}`);
    const user = userLeave(socket.id);

    if (user) {
      console.log(`User ${user.username} left room ${user.room}`);
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

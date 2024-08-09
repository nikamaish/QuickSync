// Your server-side code for personal chat
const http = require("http");
const express = require("express");
const app = express();

const path = require("path");
const { Server } = require("socket.io");
// it is class of this socket.io library which is used to create the server.

const server = http.createServer(app);
// why used http.createServer(app) because we are using express and express is built on top of http module so we need to create the server using http module.
const io = new Server(server); //
// it is used to create the server and pass the server object to the socket.io server.

const IORedis = require("ioredis");
const redisClient = new IORedis(); // create a new ioredis client

// Keep track of connected users and their socket IDs
const users = new Map();
// it will store the user name and socket id of the user who is connected to the server.

// Socket.io
io.on("connection", (socket) => {
  socket.on("join", (username) => {
    users.set(socket.id, username);
    io.emit("user-list", Array.from(users.values()));
  });

  socket.on("user-message", async (data) => {
    const { recipient, message } = data;
    const sender = users.get(socket.id);

    const recipientSocketId = Array.from(users.entries()).find(
      ([id, name]) => name === recipient
    )?.[0];
    // This code snippet is written in JavaScript and appears to be using the Array.from() method along with the find() method to search for a specific user's name (recipient) in a Map named users

    // So, the overall purpose of this code is to find the id associated with a user whose name matches the specified recipient in the users Map. If a match is found, it assigns the id to the recipientSocketId variable; otherwise, recipientSocketId will be undefined.

    // .find(([id, name]) => name === recipient): This uses the find() method on the array to search for the first entry where the name property (the second element in each key-value pair) is equal to the specified recipient.

    // ?.[0]: This is the optional chaining (nullish coalescing) operator in JavaScript. It allows safe navigation and prevents errors if the result of the expression before it is null or undefined. In this case, it accesses the first element of the found entry (the id or key).

    // if you dont understand then just msg without using recipient and it will show undefined user

    // if recipientSocketId found then send the message to that user, below code shows that
    // emit is used to send the message to the specific user

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("message", { sender, recipient, message });
    }

    io.to(socket.id).emit("message", { sender, recipient, message });

    // Store the message in Redis using ioredis
    try {
      await redisClient.rpush(sender, JSON.stringify({ recipient, message }));
      // 
      await redisClient.rpush(recipient, JSON.stringify({ sender, message }));
      // await redisClient.rpush(sender, JSON.stringify({ recipient, message }));: This line uses the rpush command in Redis to push a new message onto the end of the list associated with the sender key. The message is a JavaScript object containing properties for the recipient and the message. The JSON.stringify() method is used to convert the JavaScript object into a JSON-formatted string before storing it in Redis.
    } catch (error) {
      console.error("Error storing message in Redis:", error);
    }
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);
    io.emit("user-list", Array.from(users.values()));
  });
});

app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  return res.sendFile("/public/index.html");
});

server.listen(9000, () => console.log(`Server Started at PORT:9000`));

// for group chat ///

//
// const http = require("http");
// const express = require("express");
// const path = require("path");
// const { Server } = require("socket.io");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// // Socket.io
// io.on("connection", (socket) => {
//   socket.on("user-message", (message) => {
//     io.emit("message", message);
//   });
// });

// app.use(express.static(path.resolve("./public")));

// app.get("/", (req, res) => {
//   return res.sendFile("/public/index.html");
// });

// server.listen(9000, () => console.log(`Server Started at PORT:9000`));

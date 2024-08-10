import React, { useState, useEffect } from "react";
import Socket from "../Socket/Socket";

const Chat = ({ username, room }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Socket.emit("joinRoom", { username, room });

    Socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      Socket.disconnect();
    };
  }, [username, room]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      Socket.emit("chatMessage", message);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index}>
            <p>
              <strong>{msg.username}</strong>: {msg.text}{" "}
              <span>{msg.time}</span>
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;

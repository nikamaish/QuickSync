import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Qs from 'qs';

const Chat = () => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const socket = io();

  useEffect(() => {
    // Parse username and room from the URL
    const { username, room } = Qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    setUsername(username);
    setRoom(room);

    // Join the chat room
    socket.emit('joinRoom', { username, room });

    // Listen for room and user updates
    socket.on('roomUsers', ({ room, users }) => {
      setRoom(room);
      setUsers(users);
    });

    // Listen for messages from the server
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up on component unmount
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Emit the message to the server
    socket.emit('chatMessage', trimmedMessage);

    // Clear the input
    setMessage('');
  };

  // Handle leaving the chat room
  const handleLeave = () => {
    const leaveRoom = window.confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
      window.location = '/';
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>{room}</h1>
        <button id="leave-btn" onClick={handleLeave}>Leave</button>
        <ul id="users">
          {users.map((user, index) => (
            <li key={index}>{user.username}</li>
          ))}
        </ul>
      </header>
      <main className="chat-main">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <p className="meta">
                <strong>{msg.username}</strong> <span>{msg.time}</span>
              </p>
              <p className="text">{msg.text}</p>
            </div>
          ))}
        </div>
        <form id="chat-form" onSubmit={handleSubmit}>
          <input
            type="text"
            id="msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
            autoComplete="off"
          />
          <button type="submit">Send</button>
        </form>
      </main>
    </div>
  );
};

export default Chat;

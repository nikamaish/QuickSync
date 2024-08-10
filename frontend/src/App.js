import React, { useState } from "react";
import JoinChat from "./components/JoinChat/JoinChat";
import Chat from "./components/Chat/Chat"; // The Chat component we created earlier

function App() {
  const [user, setUser] = useState(null);

  const handleJoin = (userData) => {
    setUser(userData);
  };

  return (
    <div className="App">
      {!user ? (
        <JoinChat onJoin={handleJoin} />
      ) : (
        <Chat username={user.username} room={user.room} />
      )}
    </div>
  );
}

export default App;

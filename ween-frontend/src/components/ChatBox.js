// src/components/ChatBox.js
import React, { useState } from 'react';

function ChatBox({ onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() !== '') {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 p-2 border border-gray-300 rounded-lg"
      />
      <button
        onClick={handleSend}
        className="bg-[#FF857A] text-white py-2 px-4 ml-4 rounded-lg shadow-md hover:bg-[#FF6B6B] transition duration-300"
      >
        Send
      </button>
    </div>
  );
}

export default ChatBox;

// src/components/ChatWindow.js
import React, { useState } from 'react';
import ChatBox from './ChatBox';
import Message from './Message';

function ChatWindow() {
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (message) => {
    const newMessage = { text: message, sender: 'user' };
    setMessages([...messages, newMessage]);

    // Simulate bot response (this will be replaced by the ChatGPT API later)
    setTimeout(() => {
      const botMessage = { text: `Bot response to: "${message}"`, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1000);
  };

  return (
    <div className="chat-window w-full max-w-4xl lg:max-w-7xl bg-white shadow-lg rounded-lg p-6 mt-8">
      <div className="messages max-h-96 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} sender={msg.sender} />
        ))}
      </div>
      <ChatBox onSendMessage={handleSendMessage} />
    </div>
  );
}

export default ChatWindow;

// src/components/Message.js
import React from 'react';

function Message({ text, sender }) {
  const isUser = sender === 'user';
  return (
    <div className={`message ${isUser ? 'bg-[#FF857A] text-white' : 'bg-[#dbd1ed]'} p-3 rounded-lg mb-2 max-w-xs ${isUser ? 'self-end' : 'self-start'}`}>
      <p>{text}</p>
    </div>
  );
}

export default Message;

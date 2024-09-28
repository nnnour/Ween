// components/Message.js
import React from 'react';

function Message({ text, sender }) {
  return (
    <div className={`message ${sender}`}>
      <p>{text}</p>
    </div>
  );
}

export default Message;

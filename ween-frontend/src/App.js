import React from 'react';
import ChatWindow from './components/ChatWindow';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]"> {/* Neutral background */}
      <Navbar />
      <div className="flex flex-col items-center justify-center py-10">
        {/* Ween AI Title with strong contour and shadow */}
        <h1 className="text-6xl font-extrabold text-[#679BF7] text-contour drop-shadow-2xl">
          Ween AI
        </h1>
        
        {/* Chat Window */}
        <ChatWindow />
      </div>
    </div>
  );
}

export default App;

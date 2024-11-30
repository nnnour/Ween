import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Supabase client setup
const supabase = createClient(
  "https://imqngudzgrokpfrmyvat.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcW5ndWR6Z3Jva3Bmcm15dmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzOTkzMjcsImV4cCI6MjA0NTk3NTMyN30.hX6JbRjTbTEQUrnhdxNBy-wHQijbOQLO9fPVztXCjEo"
);

function Success() {
  const [user, setUser] = useState(null); // Track user state
  const [messages, setMessages] = useState([]); // Track chatbot messages
  const [input, setInput] = useState(''); // Input for the chatbot
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user); // Set user data if session exists
      } else {
        navigate('/'); // Redirect to login page if no session
      }
    };
    fetchUser();
  }, [navigate]);

  // Logout function
  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/'); // Redirect to login page after successful logout
    } else {
      console.error('Error signing out:', error.message);
    }
  };

  // Handle sending a message to the chatbot
  const handleSendMessage = () => {
    if (input.trim()) {
      const userMessage = { sender: 'user', text: input };
      const botMessage = { sender: 'bot', text: `You said: ${input}` }; // Simulating bot response

      setMessages((prev) => [...prev, userMessage, botMessage]);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-100 to-blue-200 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 md:p-8 mb-4">
        <header className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-700 mb-6">Success</h1>
          {user ? (
            <div>
              <p className="text-lg text-gray-600 mb-4">Welcome, {user.email}</p>
              <button
                onClick={signOutUser}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition mb-4"
              >
                Logout
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">User is not logged in</p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              >
                Go back home
              </button>
            </div>
          )}
        </header>
      </div>

      {/* Chatbot Section */}
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Chat with Ween AI</h2>
        <div className="h-60 overflow-y-auto border border-gray-300 rounded p-4 mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
            >
              <p
                className={`inline-block px-4 py-2 rounded ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.text}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow border border-gray-300 rounded px-4 py-2 mr-2"
          />
          <button
            onClick={handleSendMessage}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success;

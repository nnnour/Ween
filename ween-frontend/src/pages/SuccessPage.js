import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect"; // Import the Typewriter package
import { getUserLocation, getNearbyRestaurants } from "../utils/googleMaps";
import { fetchChatbotResponse } from "../utils/openAIchat"; // Use the OpenAI helper function
import supabase from "../supabaseClient";

function Success() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        navigate("/");
      }
    };
    fetchUser();
  }, [navigate]);

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/");
    } else {
      console.error("Error signing out:", error.message);
    }
  };

  const fetchRestaurantSuggestions = async () => {
    try {
      const location = await getUserLocation();
      const restaurants = await getNearbyRestaurants(location);

      const restaurantList = restaurants.slice(0, 5).map((r) => ({
        name: r.name,
        rating: r.rating || "N/A",
        vicinity: r.vicinity,
        types: r.types?.join(", ") || "Various cuisines",
        distance: `${Math.round(r.distance / 1000)} km`,
      }));

      const botResponse = await fetchChatbotResponse(restaurantList);

      // Split and send each restaurant description as a separate message
      restaurantList.forEach((restaurant, index) => {
        const description = botResponse.split("\n\n")[index] || "";
        const formattedMessage = `🍽️ **${restaurant.name}** (${restaurant.rating} ⭐): ${description}`;

        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: formattedMessage, typewriter: true },
        ]);
      });
    } catch (error) {
      console.error("Error fetching restaurant suggestions:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I couldn’t fetch restaurant suggestions right now.", typewriter: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      const userMessage = { sender: "user", text: input };
      setMessages((prev) => [...prev, userMessage]);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Thinking...", typewriter: true, speed: 80 },
        ]);
      }, 500); // "Thinking..." message sent immediately after a short delay.

      setInput("");
      setIsLoading(true);
      setTimeout(fetchRestaurantSuggestions, 1000); // Fetch suggestions after "Thinking..." appears.
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-100 to-blue-200 p-6">
      {/* Header Section */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-4 mb-6 flex flex-col items-center">
        <h1 className="text-xl font-bold text-gray-700 mb-3">Success</h1>
        {user && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Welcome, {user.email}</p>
            <button
              onClick={signOutUser}
              className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600 transition text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg p-6 flex flex-col h-[85vh]">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Chat with Ween AI</h2>
        <div className="flex-grow overflow-y-auto border border-gray-300 rounded p-4 mb-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-md text-base ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {message.typewriter ? (
                  <Typewriter
                    onInit={(typewriter) => {
                      typewriter
                        .typeString(message.text)
                        .pauseFor(500)
                        .start();
                    }}
                    options={{
                      delay: message.speed || 3, // Faster speed for main messages, slower for "Thinking..."
                    }}
                  />
                ) : (
                  message.text.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow border border-gray-300 rounded px-4 py-2 text-base"
          />
          <button
            onClick={handleSendMessage}
            className="ml-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition text-base"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success;

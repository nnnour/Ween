import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";
import { getUserLocation, getNearbyRestaurants } from "../utils/googleMaps";
import { fetchChatbotResponse } from "../utils/openAIchat";
import supabase from "../supabaseClient";

function Success() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    cuisine: null,
    priceRange: null,
    distance: null,
  });
  const [restaurants, setRestaurants] = useState([]);
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

    // Add a welcome message when the chat loads
    setMessages([
      {
        sender: "bot",
        text: "Hey there! 👋 I'm Ween, your AI restaurant assistant. 🍽️ Tell me what you're craving, and I'll find great places nearby! 📍 I can also help with details like hours ⏰, reviews ⭐, and menus 📖. What are you in the mood for today? 😋",
        typewriter: true,
      },
    ]);
  }, [navigate]);

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/");
    } else {
      console.error("Error signing out:", error.message);
    }
  };

  const fetchRestaurantSuggestions = async (userInput) => {
    try {
      const location = await getUserLocation();
      const restaurants = await getNearbyRestaurants(location);
      setRestaurants(restaurants);

      // Filter restaurants based on user preferences
      const filteredRestaurants = restaurants.filter((restaurant) => {
        const matchesCuisine = userPreferences.cuisine
          ? restaurant.types?.includes(userPreferences.cuisine)
          : true;
        const matchesPrice = userPreferences.priceRange
          ? restaurant.price_level === userPreferences.priceRange
          : true;
        const matchesDistance = userPreferences.distance
          ? restaurant.distance <= userPreferences.distance
          : true;
        return matchesCuisine && matchesPrice && matchesDistance;
      });

      const botResponse = await fetchChatbotResponse({
        userInput,
        restaurants: filteredRestaurants,
        preferences: userPreferences,
      });

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botResponse, typewriter: true },
      ]);
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
      }, 500);

      setInput("");
      setIsLoading(true);
      setTimeout(() => fetchRestaurantSuggestions(input), 1000);
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
              className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}
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
                      delay: message.speed || 3,
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
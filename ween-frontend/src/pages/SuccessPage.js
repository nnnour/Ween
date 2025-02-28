// Import React hooks and necessary libraries/components
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";
// Import utility functions for location and restaurant fetching
import { getUserLocation, getNearbyRestaurants } from "../utils/googleMaps";
// Import function to call the chatbot API (OpenAI)
import { fetchChatbotResponse } from "../utils/openAIchat";
// Import Supabase client for authentication and data storage
import supabase from "../supabaseClient";
// Import custom hook for maintaining conversation context/memory
import useConversationMemory from "./useConversationMemory";

// Utility function to detect known cuisines or keywords from user input
function detectCuisine(input) {
  // Convert input to lower case for case-insensitive matching
  const text = input.toLowerCase();

  // Check for various cuisine keywords
  if (text.includes("pizza")) return "pizza";
  if (text.includes("burger") || text.includes("burgers")) return "burger";
  if (text.includes("sushi")) return "sushi";
  if (text.includes("steak")) return "steak";
  if (text.includes("italian")) return "italian";
  if (text.includes("mexican")) return "mexican";
  if (text.includes("chinese")) return "chinese";
  if (text.includes("indian")) return "indian";

  // Detect if input implies any cuisine is acceptable (fallback)
  if (text.match(/anything|whatever|any|everything/)) {
    return null; // fallback: show all
  }

  // Return trimmed input or null if empty
  return input.trim() || null;
}

// Enhanced food preferences detection function
function extractFoodPreferences(userInput) {
  // List of common cuisine types
  const cuisineTypes = [
    'italian', 'chinese', 'indian', 'mexican', 'japanese', 'thai', 'american', 
    'french', 'mediterranean', 'greek', 'korean', 'vietnamese', 'spanish',
    'middle eastern', 'vegan', 'vegetarian', 'gluten-free', 'healthy', 'fast food'
  ];
  
  // List of food types that might be mentioned
  const foodTypes = [
    'pizza', 'burger', 'sushi', 'pasta', 'salad', 'sandwich', 'taco', 'curry',
    'noodle', 'steak', 'seafood', 'breakfast', 'brunch', 'dinner', 'lunch',
    'dessert', 'coffee', 'bakery', 'ice cream'
  ];
  
  // List of price-related keywords
  const priceIndicators = [
    'cheap', 'expensive', 'affordable', 'budget', 'high-end', 'fancy', 'fine dining',
    'casual', 'inexpensive', 'pricey', 'upscale', 'moderate'
  ];
  
  // Convert input to lower case for case-insensitive matching
  const lowerInput = userInput.toLowerCase();
  // Create an object that holds detected preferences for cuisines, food types, and price hints
  const detectedPreferences = {
    cuisines: cuisineTypes.filter(cuisine => lowerInput.includes(cuisine)),
    foodTypes: foodTypes.filter(food => lowerInput.includes(food)),
    priceHints: priceIndicators.filter(price => lowerInput.includes(price))
  };
  
  // Return the detected preferences as an object
  return detectedPreferences;
}

// Main component for the success page after authentication
function SuccessPage() {
  // Log component render for debugging
  console.log("SuccessPage component rendering");
  
  // Define state variables for user, chat messages, input field, loading and error states
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);

  // State for storing user preferences (cuisine, price, distance)
  const [userPreferences, setUserPreferences] = useState({
    cuisine: null,
    priceRange: null,
    distance: null,
  });

  // State for storing the fetched list of nearby restaurants
  const [restaurants, setRestaurants] = useState([]);

  // Use custom hook to maintain conversation memory/context
  const { conversationContext, setConversationContext, updateMemory } = useConversationMemory();

  // Hook from react-router-dom to handle navigation
  const navigate = useNavigate();

  // useEffect to fix viewport height issues on iOS devices
  useEffect(() => {
    const fixVhForMobile = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    // Initial fix and add event listeners for changes in viewport dimensions
    fixVhForMobile();
    window.addEventListener('resize', fixVhForMobile);
    window.addEventListener('orientationchange', fixVhForMobile);
    
    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('resize', fixVhForMobile);
      window.removeEventListener('orientationchange', fixVhForMobile);
    };
  }, []);

  // useEffect for initial component load: user authentication and fetching initial data
  useEffect(() => {
    console.log("Initial useEffect running");
    // Function to fetch authenticated user from Supabase
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          navigate("/");
          return;
        }
        
        if (user) {
          console.log("User authenticated:", user.email);
          setUser(user);
        } else {
          console.log("No user found, redirecting to login");
          navigate("/");
        }
      } catch (error) {
        console.error("Exception in fetchUser:", error);
        navigate("/");
      }
    };
    
    // Call the fetchUser function
    fetchUser();

    // Set initial welcome message in the chat
    setMessages([
      {
        sender: "bot",
        text: "Hey there! 👋 I'm Ween, your AI restaurant assistant. 🍽️ Tell me what you're craving, and I'll find great places nearby! 📍 I can also help with details like hours ⏰, reviews ⭐, and menus 📖. What are you in the mood for today? 😋",
        typewriter: true, // Enable typewriter effect for welcome message
      },
    ]);

    // Initialize user location and fetch nearby restaurants
    const initLocation = async () => {
      try {
        console.log("Attempting to get initial location");
        const location = await getUserLocation();
        console.log("Location obtained:", location);
        const fetchedRestaurants = await getNearbyRestaurants(location);
        console.log(`Fetched ${fetchedRestaurants.length} restaurants`);
        setRestaurants(fetchedRestaurants);
      } catch (error) {
        console.error("Error initializing location/restaurants:", error);
        setErrorState("location");
      }
    };

    // Call the function to initialize location/restaurants data
    initLocation();
  }, [navigate]);

  // useEffect to handle mobile keyboard appearance (ensures the view resets on input focus)
  useEffect(() => {
    // Handler to adjust scrolling when virtual keyboard appears
    const handleKeyboardAppearance = () => {
      // Delay scrolling to ensure the keyboard is fully shown
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
      }, 300);
    };

    // Select the input element
    const inputElement = document.querySelector('input[type="text"]');
    
    if (inputElement) {
      // Add event listener for input focus
      inputElement.addEventListener('focus', handleKeyboardAppearance);
      
      // Cleanup the event listener on unmount
      return () => {
        inputElement.removeEventListener('focus', handleKeyboardAppearance);
      };
    }
  }, []);

  // Function to sign out the user using Supabase authentication
  const signOutUser = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        navigate("/");
      } else {
        console.error("Error signing out:", error.message);
      }
    } catch (error) {
      console.error("Exception during sign out:", error);
    }
  };

  // Main function to fetch restaurant suggestions based on user input and preferences
  const fetchRestaurantSuggestions = async (userInput) => {
    console.log("fetchRestaurantSuggestions called with:", userInput);
    setIsLoading(true);
    setErrorState(null);
    
    try {
      // Determine if the input is a short follow-up message or a new query
      const isLikelyFollowUp = userInput.trim().length < 25;
      const intent = isLikelyFollowUp ? "follow_up" : "new_query";
      console.log("Detected intent:", intent);

      // Remove any existing "Thinking..." messages before processing new input
      setMessages((prev) => prev.filter((msg) => msg.text !== "Thinking..."));
      
      // Add a "Thinking..." message to indicate processing
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thinking...", typewriter: false, speed: 80 },
      ]);

      // If restaurant data has not been fetched yet, attempt to fetch it
      if (restaurants.length === 0) {
        console.log("No restaurants data, fetching...");
        try {
          const location = await getUserLocation();
          console.log("Location:", location);
          const fetchedRestaurants = await getNearbyRestaurants(location);
          console.log(`Fetched ${fetchedRestaurants.length} restaurants`);
          setRestaurants(fetchedRestaurants);
          
          // If no restaurants are found, update error state and notify user
          if (fetchedRestaurants.length === 0) {
            setErrorState("no-restaurants");
            setMessages((prev) => [
              ...prev.filter((msg) => msg.text !== "Thinking..."),
              { 
                sender: "bot", 
                text: "I couldn't find any restaurants near your location. Could you try again or be more specific about what you're looking for?", 
                typewriter: false 
              },
            ]);
            setIsLoading(false);
            return;
          }
        } catch (locError) {
          console.error("Location or restaurant fetch error:", locError);
          setErrorState("location");
          setMessages((prev) => [
            ...prev.filter((msg) => msg.text !== "Thinking..."),
            { 
              sender: "bot", 
              text: "I'm having trouble getting your location. Could you check your browser permissions and try again? Or you can tell me what area you're interested in.", 
              typewriter: false 
            },
          ]);
          setIsLoading(false);
          return;
        }
      }

      // Copy current user preferences for updating based on new input
      let updatedPreferences = { ...userPreferences };

      // Define negative sentiment indicators for refining suggestions
      const negativeIndicators = [
        'no', 'nope', 'don\'t like', 'don\'t want', 'something else', 'not interested',
        'different', 'instead', 'rather', 'prefer', 'actually', 'healthier', 'cheaper'
      ];
      
      // Determine if the user input has negative sentiment
      const hasNegativeSentiment = negativeIndicators.some(indicator => 
        userInput.toLowerCase().includes(indicator)
      );
      console.log("Has negative sentiment:", hasNegativeSentiment);

      // Use enhanced food preferences extraction function
      const userPrefs = extractFoodPreferences(userInput);
      console.log("Extracted preferences:", userPrefs);
      
      // Check if user specifically mentions vegetarian, vegan or healthy options
      if (/vegetarian|vegan|healthy/i.test(userInput)) {
        updatedPreferences.cuisine = "vegetarian";
      }
      // If user asks for something else or provides negative feedback, mark for refinement
      else if (/something else|another option|try again/i.test(userInput) || hasNegativeSentiment) {
        updatedPreferences.refine = true;
      }
      // Otherwise, use the detectCuisine utility to determine specific cuisine
      else {
        const detected = detectCuisine(userInput);
        updatedPreferences.cuisine = detected; // can be null or a known string
      }

      // Adjust price preferences based on detected price hints in user input
      if (userPrefs.priceHints.length > 0) {
        if (userPrefs.priceHints.some(hint => ['cheap', 'affordable', 'inexpensive', 'budget'].includes(hint))) {
          updatedPreferences.priceRange = 1; // Low price range
        } else if (userPrefs.priceHints.some(hint => ['expensive', 'high-end', 'fancy', 'fine dining', 'upscale', 'pricey'].includes(hint))) {
          updatedPreferences.priceRange = 3; // High price range
        } else if (userPrefs.priceHints.some(hint => ['moderate', 'mid-range'].includes(hint))) {
          updatedPreferences.priceRange = 2; // Medium price range
        }
      }

      console.log("Updated preferences:", updatedPreferences);
      // Update the state with new preferences
      setUserPreferences(updatedPreferences);

      // If the input is a short follow-up, add context to the conversation memory
      if (isLikelyFollowUp) {
        setConversationContext(prevContext => [
          ...prevContext,
          { 
            role: "system", 
            content: "Note: The user's message is brief and likely a follow-up or refinement to their previous request. Maintain context from earlier in the conversation."
          }
        ]);
      }

      // If negative sentiment is detected, add system context to suggest alternative options
      if (hasNegativeSentiment) {
        setConversationContext(prevContext => [
          ...prevContext,
          { 
            role: "system", 
            content: "The user seems dissatisfied with previous suggestions. Offer alternative options and ask for more specific preferences."
          }
        ]);
      }

      // Add the user's input to the conversation context
      setConversationContext((prev) => [
        ...prev,
        { role: "user", content: userInput },
      ]);

      // Filter the restaurants list based on the updated user preferences
      const filteredRestaurants = restaurants.filter((restaurant) => {
        // Check if the restaurant matches the cuisine preference if provided
        const matchesCuisine = updatedPreferences.cuisine
          ? restaurant.types?.includes(updatedPreferences.cuisine)
          : true;

        // Check if the restaurant's price level matches the user's preference
        const matchesPrice = updatedPreferences.priceRange
          ? restaurant.price_level === updatedPreferences.priceRange
          : true;

        // Check if the restaurant is within the desired distance (if provided)
        const matchesDistance = updatedPreferences.distance
          ? restaurant.distance <= updatedPreferences.distance
          : true;

        return matchesCuisine && matchesPrice && matchesDistance;
      });
      
      console.log(`Filtered to ${filteredRestaurants.length} restaurants`);

      // Call the OpenAI chatbot with the current context and filtered restaurants
      console.log("Calling OpenAI...");
      const botResponse = await fetchChatbotResponse({
        userInput,
        restaurants: filteredRestaurants.length > 0 ? filteredRestaurants : restaurants,
        preferences: updatedPreferences,
        context: conversationContext,
        intent: intent
      });
      console.log("Got response from OpenAI:", botResponse);

      // Update conversation memory with the new interaction
      updateMemory(userInput, botResponse);

      // Add the chatbot's response to the conversation context
      setConversationContext((prev) => [
        ...prev,
        { role: "assistant", content: botResponse },
      ]);

      // Remove the "Thinking..." message after processing
      setMessages((prev) =>
        prev.filter((msg) => msg.text !== "Thinking...")
      );

      // Append the bot's formatted response as a new message
      setMessages((prev) => [
        ...prev,
        { 
          sender: "bot", 
          text: botResponse, 
          typewriter: false, // Regular text response (no typewriter effect)
        },
      ]);
    } catch (error) {
      console.error("Error in fetchRestaurantSuggestions:", error);

      // Remove any "Thinking..." messages if an error occurs
      setMessages((prev) =>
        prev.filter((msg) => msg.text !== "Thinking...")
      );

      // Display an error message to the user
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I'm having trouble processing your request right now. Please try again in a moment.",
          typewriter: false,
        },
      ]);
      
      // Set error state to reflect an API error
      setErrorState("api");
    } finally {
      // End loading state regardless of success or failure
      setIsLoading(false);
    }
  };

  // Function to handle sending a message from the user
  const handleSendMessage = () => {
    console.log("handleSendMessage called");
    if (input.trim()) {
      // Capture current user input
      const currentInput = input;
      console.log("User input:", currentInput);
      
      // Add the user's message to the chat display
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: currentInput },
      ]);

      // Clear the input field and set loading state
      setInput("");
      setIsLoading(true);

      // Wait for a short delay before fetching suggestions
      setTimeout(() => {
        fetchRestaurantSuggestions(currentInput);
      }, 800);
    }
  };

  // Handle Enter key press to send a message if not loading
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  // Touch handler for mobile devices to focus on the input field
  const handleTouchStart = (e) => {
    e.currentTarget.focus();
  };

  // Function to render debugging information (visible only in development mode)
  const debugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 text-xs text-amber-800 rounded-xl">
        <div>API Key Set: {process.env.REACT_APP_OPENAI_API_KEY ? "Yes" : "No"}</div>
        <div>Restaurants: {restaurants.length}</div>
        <div>Context Messages: {conversationContext.length}</div>
        <div>Error State: {errorState || "None"}</div>
      </div>
    );
  };

  // useEffect to dynamically add custom CSS for the component's design
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes wiggle {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(5deg); }
        50% { transform: rotate(0deg); }
        75% { transform: rotate(-5deg); }
        100% { transform: rotate(0deg); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .emoji-float {
        animation: float 3s ease-in-out infinite;
        display: inline-block;
      }
      
      .food-wiggle:hover {
        animation: wiggle 0.5s ease-in-out;
      }
      
      .food-pulse {
        animation: pulse 2s ease-in-out infinite;
      }
      
      .chat-bubble {
        position: relative;
      }
      
      .user-bubble::after {
        content: '';
        position: absolute;
        right: -10px;
        bottom: 15px;
        width: 0;
        height: 0;
        border: 10px solid transparent;
        border-left-color: #fef3c7;
        border-right: 0;
        margin-top: -10px;
        margin-right: -10px;
      }
      
      .bot-bubble::after {
        content: '';
        position: absolute;
        left: -10px;
        bottom: 15px;
        width: 0;
        height: 0;
        border: 10px solid transparent;
        border-right-color: #FFFFFF;
        border-left: 0;
        margin-top: -10px;
        margin-left: -10px;
      }
      
      .food-pattern {
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      }
      
      .doodle-pattern {
        background-image: url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      }
      
      .pb-safe {
        padding-bottom: env(safe-area-inset-bottom, 0);
      }
      
      @media (max-width: 640px) {
        .chat-bubble {
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        
        .chat-bubble::after {
          bottom: 5px !important;
        }
        
        .food-pattern {
          background-size: 30px 30px;
        }
        
        .doodle-pattern {
          background-size: 26px 13px;
        }
      }
      
      @media (prefers-reduced-motion: reduce) {
        .emoji-float, .food-wiggle, .food-pulse {
          animation: none !important;
        }
      }
    `;
    // Append the style element to the document head
    document.head.appendChild(style);
    
    // Cleanup the style element on component unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Render the component's UI
  return (
    <div className="min-h-screen bg-amber-50 food-pattern pb-safe">
      {/* Floating decorative food emojis */}
      <div className="fixed h-full w-full overflow-hidden pointer-events-none" aria-hidden="true">
        <span className="emoji-float absolute text-2xl sm:text-3xl md:text-4xl top-[10%] left-[5%]" style={{animationDelay: '0.5s'}}>🍕</span>
        <span className="emoji-float absolute text-2xl sm:text-3xl md:text-4xl top-[15%] right-[7%]" style={{animationDelay: '1.5s'}}>🍔</span>
        <span className="emoji-float absolute text-2xl sm:text-3xl md:text-4xl top-[35%] left-[8%]" style={{animationDelay: '2s'}}>🍜</span>
        <span className="emoji-float absolute text-2xl sm:text-3xl md:text-4xl top-[60%] right-[10%]" style={{animationDelay: '1s'}}>🌮</span>
        <span className="emoji-float absolute text-2xl sm:text-3xl md:text-4xl bottom-[15%] left-[12%]" style={{animationDelay: '0s'}}>🥑</span>
        <span className="emoji-float absolute text-2xl sm:text-3xl md:text-4xl bottom-[5%] right-[5%]" style={{animationDelay: '2.5s'}}>🍣</span>
      </div>

      {/* App Header */}
      <header className="sticky top-0 bg-orange-500 shadow-md z-50 py-2 sm:py-3">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-white text-xl sm:text-2xl font-bold flex items-center">
              <span className="food-wiggle inline-block mr-1 sm:mr-2">🍽️</span>
              <span className="font-extrabold text-white">Ween</span>
              <span className="ml-1 sm:ml-2 bg-white text-orange-500 text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold">AI DINING ASSISTANT</span>
            </div>
          </div>
          {user && (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="text-white text-xs sm:text-sm hidden md:block">{user.email}</div>
              <button
                onClick={signOutUser}
                className="bg-white text-orange-600 hover:bg-orange-100 transition-colors px-2 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {process.env.NODE_ENV === 'development' && debugInfo()}
        
        {/* Main chat container styled like a menu/plate */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-4 border-dashed border-orange-200 overflow-hidden">
          {/* Chat header resembling a menu top */}
          <div className="bg-orange-400 py-3 sm:py-4 px-4 sm:px-6 doodle-pattern">
            <h2 className="text-white font-bold text-lg text-center"></h2>
          </div>
          
          {/* Chat messages area - rendered only when there are messages */}
          {messages.length > 0 && (
            <div className="p-3 sm:p-6 overflow-y-auto" style={{
              minHeight: "150px", 
              maxHeight: "calc(var(--vh, 1vh) * 50)",
              '@media (min-width: 640px)': {
                maxHeight: "calc(var(--vh, 1vh) * 65)"
              }
            }}>
              <div className="space-y-4 sm:space-y-5">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.sender === "bot" && (
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-orange-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 border-2 border-orange-200">
                        <span className="text-lg sm:text-xl">🤖</span>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] py-2 sm:py-3 px-3 sm:px-4 rounded-xl shadow-md chat-bubble ${
                        message.sender === "user"
                          ? "bg-amber-100 text-orange-900 user-bubble"
                          : "bg-white text-gray-800 border border-orange-100 bot-bubble"
                      }`}
                    >
                      {message.text === "Thinking..." ? (
                        <div className="flex items-center space-x-2">
                          <Typewriter
                            onInit={(typewriter) => {
                              typewriter
                                .typeString("Thinking")
                                .pauseFor(300)
                                .typeString(".")
                                .pauseFor(300)
                                .typeString(".")
                                .pauseFor(300)
                                .typeString(".")
                                .pauseFor(300)
                                .deleteChars(3)
                                .pauseFor(300)
                                .typeString("...")
                                .start();
                            }}
                            options={{
                              loop: true,
                              delay: 50,
                            }}
                          />
                          <span className="inline-block">
                            <span className="inline-block food-pulse" style={{animationDelay: '0s'}}>🍳</span>
                          </span>
                        </div>
                      ) : message.typewriter ? (
                        <Typewriter
                          onInit={(typewriter) => {
                            typewriter
                              .typeString(message.text)
                              .pauseFor(500)
                              .start();
                          }}
                          options={{ delay: message.speed || 3 }}
                        />
                      ) : (
                        <div className="prose prose-orange prose-sm sm:prose-base">
                          {message.text.split("\n").map((line, i) => (
                            <span key={i} className="block">
                              {line}
                              {i < message.text.split("\n").length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {message.sender === "user" && (
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-amber-200 rounded-full flex items-center justify-center ml-2 sm:ml-3 border-2 border-amber-300">
                        <span className="text-lg sm:text-xl">😋</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Input area styled like the bottom of a menu */}
          <div className="bg-orange-50 border-t-2 border-dashed border-orange-200 p-2 sm:p-4">
            <div className="flex items-center">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onTouchStart={handleTouchStart}
                  placeholder="What are you craving today?"
                  className="w-full py-2 sm:py-3 pl-10 sm:pl-12 pr-2 sm:pr-4 bg-white border-2 border-orange-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-700 text-sm sm:text-base"
                  disabled={isLoading}
                />
                <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-lg sm:text-xl">
                  🍴
                </span>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className={`ml-2 sm:ml-3 flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 rounded-full font-medium ${
                  isLoading 
                    ? 'bg-gray-300 text-gray-500' 
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                } transition-colors shadow-md text-sm sm:text-base`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden sm:inline">Thinking...</span>
                    <span className="sm:hidden">...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="hidden sm:inline mr-2">Send</span>
                    <span className="text-lg sm:text-xl">📤</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer styled like a receipt */}
        <div className="mt-4 sm:mt-6 bg-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl border border-dashed border-orange-200 text-center text-orange-800 text-xs sm:text-sm">
          <div className="font-mono border-b border-orange-100 pb-1 mb-1">--- Your Food Guide Receipt ---</div>
          <div>Thanks for using Ween AI • Find your next delicious meal!</div>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;

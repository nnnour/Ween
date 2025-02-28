// Import axios for making HTTP requests to external APIs
import axios from 'axios';

// Retrieve the OpenAI API key from environment variables
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Export an asynchronous function that fetches a chatbot response using the OpenAI API
export const fetchChatbotResponse = async ({ 
  userInput, 
  restaurants = [], 
  preferences = {}, 
  context = [],
  intent = "new_query" 
}) => {
  try {
    // Log debug information about the incoming request
    console.log("fetchChatbotResponse called with input:", userInput);
    console.log("Available restaurants:", restaurants.length);
    console.log("User preferences:", preferences);
    console.log("Context length:", context.length);
    
    // Ensure that the OpenAI API key is available
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      return "I'm having trouble connecting right now. Please check your API key configuration.";
    }

    // Format restaurant data for the OpenAI API with enhanced, detailed descriptions
    const formattedRestaurants = restaurants.slice(0, 10).map(restaurant => {
      // Helper function to extract cuisine types from the restaurant data
      const getCuisineTypes = () => {
        if (!restaurant.types || restaurant.types.length === 0) return [];
        
        // List of non-cuisine types to filter out from the restaurant's types
        const nonCuisineTypes = [
          'point_of_interest', 'establishment', 'food', 'restaurant', 'place',
          'store', 'business', 'health', 'meal_delivery', 'meal_takeaway',
          'lodging', 'finance', 'convenience_store', 'gas_station', 'clothing_store'
        ];
        
        // Return only the cuisine types by filtering out non-cuisine categories
        return restaurant.types.filter(type => 
          !nonCuisineTypes.includes(type)
        );
      };
      
      // Helper function to create a detailed description of the restaurant based on its cuisine types
      const getDetailedDescription = () => {
        const cuisineTypes = getCuisineTypes();
        let description = '';
        
        // Generate detailed description based on detected cuisine types
        if (cuisineTypes.includes('pizza')) {
          description = "This beloved pizza spot is famous for its perfectly crafted pies with crispy-yet-chewy crusts and creative toppings. From classic Margherita to innovative specialty combinations, their wood-fired ovens turn out some of the most delicious pizza in town.";
        } else if (cuisineTypes.includes('italian')) {
          description = "This charming Italian eatery captures the essence of homestyle cooking with handmade pasta, rich sauces, and authentic recipes passed down through generations. The warm, inviting atmosphere makes it perfect for everything from romantic dinners to family gatherings.";
        } else if (cuisineTypes.includes('chinese')) {
          description = "This vibrant Chinese restaurant serves up bold, flavorful dishes from various regional cuisines. From delicate dim sum to sizzling stir-fries and comforting noodle soups, every dish bursts with authentic flavors and traditional cooking techniques.";
        } else if (cuisineTypes.includes('japanese') || cuisineTypes.includes('sushi')) {
          description = "This elegant Japanese restaurant showcases the art of precision cooking with meticulously prepared sushi, sashimi, and cooked specialties. The chefs pride themselves on fresh fish, perfectly seasoned rice, and beautiful presentation that's as impressive as the flavors.";
        } else if (cuisineTypes.includes('mexican')) {
          description = "This lively Mexican spot brings the vibrant flavors of authentic regional cooking to your plate. From handmade tortillas to slow-simmered moles and fresh salsas bursting with heat and flavor, every bite offers a taste of Mexico's rich culinary heritage.";
        } else if (cuisineTypes.includes('american')) {
          description = "This popular American eatery excels at elevated comfort food classics that satisfy both nostalgia and modern tastes. Expect generous portions of burgers, sandwiches, and hearty entrées made with high-quality ingredients and creative twists on traditional favorites.";
        } else if (cuisineTypes.includes('seafood')) {
          description = "This outstanding seafood destination showcases the freshest catches prepared with skill and creativity. From simply grilled fish that lets the ocean flavors shine to elaborate seafood platters and specialty dishes, it's a paradise for lovers of fruits de mer.";
        } else if (cuisineTypes.includes('bakery')) {
          description = "This delightful bakery fills the air with irresistible aromas of freshly baked goods throughout the day. Their display cases tempt with everything from artisanal breads and flaky pastries to decadent cakes and cookies made from scratch using premium ingredients.";
        } else if (cuisineTypes.includes('cafe')) {
          description = "This welcoming café offers a perfect retreat with thoughtfully sourced coffee, espresso drinks, and a tempting array of light bites. The cozy, laid-back atmosphere makes it ideal for everything from productive work sessions to casual meetups with friends.";
        } else if (cuisineTypes.includes('thai')) {
          description = "This vibrant Thai restaurant balances the four fundamental flavors of sweet, salty, sour, and spicy in every authentic dish. From aromatic curries and stir-fries to refreshing salads and noodle dishes, each plate delivers the complex, harmonious flavors Thailand is famous for.";
        } else if (cuisineTypes.includes('indian')) {
          description = "This aromatic Indian restaurant creates dishes that showcase the country's diverse regional cuisines and masterful spice blending. From tandoor-baked breads and slow-simmered curries to vegetarian specialties, every dish delivers layers of complex flavors and textures.";
        } else if (cuisineTypes.includes('bar') || cuisineTypes.includes('night_club')) {
          description = "This spirited bar and eatery pairs craft drinks with a menu of craveable bites that go well beyond typical pub fare. The energetic atmosphere makes it perfect for everything from happy hour gatherings to evening social outings with good food and great vibes.";
        } else if (cuisineTypes.includes('french')) {
          description = "This refined French restaurant celebrates the art of classic cuisine with impeccable technique and quality ingredients. From perfectly executed staples to seasonal specialties, each dish reflects the tradition, elegance, and attention to detail that defines French cooking.";
        } else if (cuisineTypes.includes('mediterranean')) {
          description = "This inviting Mediterranean restaurant offers a sun-drenched menu of dishes from across the region. From olive oil-drizzled mezze and fresh seafood to herb-infused grilled meats and vegetable dishes, the bright, healthy flavors transport you to coastal villages and lively tavernas.";
        } else if (cuisineTypes.includes('vegetarian')) {
          description = "This innovative vegetarian haven creates dishes so satisfying and flavor-packed that even dedicated carnivores leave impressed. The kitchen transforms fresh, seasonal produce into creative plates that prove plant-based eating can be both nourishing and extraordinarily delicious.";
        } else {
          description = "This popular eatery has earned its reputation with consistently delicious food, attentive service, and an inviting atmosphere. The thoughtfully crafted menu offers something for everyone, whether you're seeking comfort food classics or more adventurous culinary experiences.";
        }
        
        // Append a price-level description based on the restaurant's price_level if available
        if (restaurant.price_level) {
          const priceDescriptions = [
            "The wallet-friendly prices make it a great value spot for satisfying meals without breaking the bank.",
            "With reasonable prices and generous portions, it offers a solid balance of quality and value.",
            "The somewhat higher prices reflect the quality ingredients, skilled preparation, and elevated dining experience.",
            "The premium prices are justified by the exceptional quality, expert preparation, and luxurious dining experience."
          ];
          
          if (restaurant.price_level >= 1 && restaurant.price_level <= 4) {
            description += " " + priceDescriptions[restaurant.price_level - 1];
          }
        }
        
        // Append current opening status if available from the restaurant data
        if (restaurant.opening_hours && restaurant.opening_hours.open_now !== undefined) {
          description += restaurant.opening_hours.open_now 
            ? " They're currently open and ready to welcome hungry diners."
            : " They're currently closed, so plan your visit for another time.";
        }
        
        return description;
      };
      
      // Helper function to get cuisine-appropriate emojis based on the restaurant's cuisine types
      const getEmojis = () => {
        const cuisineTypes = getCuisineTypes();
        
        if (cuisineTypes.includes('pizza')) return '🍕';
        if (cuisineTypes.includes('italian')) return '🍝';
        if (cuisineTypes.includes('chinese')) return '🥢';
        if (cuisineTypes.includes('japanese') || cuisineTypes.includes('sushi')) return '🍣';
        if (cuisineTypes.includes('mexican')) return '🌮';
        if (cuisineTypes.includes('american')) return '🍔';
        if (cuisineTypes.includes('seafood')) return '🦞';
        if (cuisineTypes.includes('bakery')) return '🥐';
        if (cuisineTypes.includes('cafe')) return '☕';
        if (cuisineTypes.includes('bar') || cuisineTypes.includes('night_club')) return '🍸';
        if (cuisineTypes.includes('thai')) return '🍲';
        if (cuisineTypes.includes('indian')) return '🍛';
        if (cuisineTypes.includes('french')) return '🥖';
        if (cuisineTypes.includes('mediterranean')) return '🫒';
        if (cuisineTypes.includes('vegetarian')) return '🥗';
        
        // Return a default emoji if no specific cuisine type is matched
        return '🍽️';
      };
      
      // Return a structured object for each restaurant including detailed description, emoji, and original data
      return {
        name: restaurant.name,
        rating: restaurant.rating || 'No rating available',
        types: restaurant.types || [],
        price_level: restaurant.price_level || 'Not specified',
        vicinity: restaurant.vicinity || '',
        
        // Detailed description created by getDetailedDescription()
        detailed_description: getDetailedDescription(),
        
        // Emoji based on the restaurant's cuisine type(s)
        emoji: getEmojis(),
        
        // Retain the original restaurant data for reference
        original_data: {
          types: restaurant.types,
          price_level: restaurant.price_level,
          rating: restaurant.rating,
          opening_hours: restaurant.opening_hours
        }
      };
    });

    // Log a sample of the formatted restaurants data for debugging
    console.log("Formatted restaurants sample:", 
      formattedRestaurants.length > 0 ? formattedRestaurants[0].name : "No restaurants available");

    // Build the system prompt with detailed instructions for the AI assistant
    const systemPrompt = `
You are Ween, a helpful AI restaurant recommendation assistant with a warm, conversational tone.

CONVERSATION CONTEXT ABILITIES:
- Maintain context awareness throughout the conversation
- Remember user preferences and dislikes within the current session
- Handle refinements naturally (when user asks for something else, suggest new options)
- When the user refines their query (like "something healthier"), connect it to previous context
- Use emojis in your responses to create a friendly, fun tone

INTERACTION GUIDELINES:
- If you've already suggested restaurants, don't repeat the same suggestions unless explicitly asked
- Ask engaging follow-up questions to guide users ("Are you looking for casual or fine dining?")
- If a user rejects a suggestion, ask a follow-up to understand their preferences better
- Keep responses friendly, concise and helpful while maintaining personality
- Include emojis throughout your responses to make them more engaging

CONVERSATION FLOW:
- After making suggestions, ask if the user wants to refine their search
- If the user's request is ambiguous, ask a clarifying question
- Handle topic changes gracefully, but try to tie back to restaurant recommendations

HANDLING OFF-TOPIC QUESTIONS:
- When the user asks about topics unrelated to restaurants or food (like weather, sports, news, school help, etc.), ALWAYS clarify that you are specifically designed to help with restaurant recommendations
- For example: "I'm your AI restaurant assistant, so I don't have information about [topic]. However, I'd be happy to recommend some great places to eat! What kind of food are you in the mood for today? 🍽️"
- After clarifying your purpose, always steer the conversation back to restaurant recommendations
- The ONLY exception is if they ask about hotels - in that case, you can provide nearby hotel recommendations since travelers often need both hotel and restaurant information

HANDLING SPECIFIC RESTAURANT QUESTIONS:
- When asked about specific details like exact hours, exact ratings, menu items, or other detailed information that isn't provided in the restaurant data, be honest and say: "I don't have the specific [hours/rating/menu/etc] information for [Restaurant Name] at the moment. Would you like me to recommend other restaurants or help you with something else?"
- Never make up specific information that isn't in the data provided
- If asked about general price range or cuisine type that IS in the data, provide that information accurately

RESPONSE FORMAT:
- Begin responses with a brief acknowledgment of the user's request
- ALWAYS suggest 4-5 restaurants when making recommendations, not fewer
- For each restaurant, use this EXACT format with emojis on both sides of the restaurant name:
  * "🍕 Tony's Pizza Napoletana 🍕: Located at 1570 Stockton Street, this restaurant has a rating of 4.5. This beloved pizza spot is famous for its perfectly crafted pies with crispy-yet-chewy crusts and creative toppings. From classic Margherita to innovative specialty combinations, their wood-fired ovens turn out some of the most delicious pizza in town. The reasonable prices make it a local favorite for pizza lovers."
  * "🦞 Waterbar Restaurant 🦞: Located at 399 The Embarcadero, this restaurant has a rating of 4.5. This outstanding seafood destination showcases the freshest catches prepared with skill and creativity. From simply grilled fish that lets the ocean flavors shine to elaborate seafood platters and specialty dishes, it's a paradise for lovers of fruits de mer. The stunning waterfront views provide a perfect backdrop for enjoying your meal."
- After listing restaurants, include a brief summary paragraph that mentions the variety of cuisine types available
- End with a follow-up question to keep the conversation flowing

IMPORTANT:
1. Always use the EXACT emoji format above for restaurant names - DO NOT use asterisks or bold formatting with ** marks
2. Use the detailed descriptions provided in the restaurant data - these are already crafted to highlight both the food and ambiance
3. Always provide the full, detailed descriptions - don't shorten them

Current intent: ${intent}
Current user preferences: ${JSON.stringify(preferences)}
`;

    // Initialize the messages array with the system prompt as the first message
    let messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];
    
    // If conversation context is provided, add user and assistant messages to maintain context
    if (context && context.length > 0) {
      // Filter out any system messages that might contain internal instructions
      const contextMessages = context.filter(msg => 
        msg.role === "user" || msg.role === "assistant"
      );
      messages.push(...contextMessages);
    }
    
    // For short user messages (likely follow-ups), add a system hint to maintain context
    if (userInput.trim().length < 25) {
      messages.push({
        role: "system",
        content: "Note: User's message is brief and likely a follow-up to their previous request. Maintain context from earlier in the conversation."
      });
    }
    
    // Define negative sentiment keywords to check if the user is dissatisfied with previous suggestions
    const negativeIndicators = [
      'no', 'nope', 'don\'t like', 'don\'t want', 'something else', 'not interested',
      'different', 'instead', 'rather', 'prefer', 'actually', 'healthier', 'cheaper'
    ];
    
    // Check if the user's input contains any negative sentiment indicators
    const hasNegativeSentiment = negativeIndicators.some(indicator => 
      userInput.toLowerCase().includes(indicator)
    );
    
    // If negative sentiment is detected, add a system message advising the assistant to offer alternative options
    if (hasNegativeSentiment) {
      messages.push({
        role: "system",
        content: "The user seems dissatisfied with previous suggestions. Offer alternative options and ask for more specific preferences."
      });
    }
    
    // Determine if the user is asking for specific restaurant details (like hours, rating, menu, etc.)
    const isAskingForSpecificDetails = (() => {
      const detailKeywords = [
        'hours', 'open', 'close', 'opening', 'closing', 
        'rating', 'stars', 'review', 'score',
        'menu', 'dish', 'food', 'serve', 'cuisine',
        'reservation', 'book', 'wait time'
      ];
      
      const questionWords = ['what', 'when', 'how', 'is', 'are', 'does', 'do'];
      
      // Check if input contains any detail keywords and question words
      const hasDetailKeyword = detailKeywords.some(keyword => 
        userInput.toLowerCase().includes(keyword)
      );
      
      const hasQuestionWord = questionWords.some(word => 
        userInput.toLowerCase().split(' ').includes(word)
      );
      
      return hasDetailKeyword && hasQuestionWord;
    })();
    
    // If specific details are being requested, add a system message to acknowledge limitations
    if (isAskingForSpecificDetails) {
      messages.push({
        role: "system",
        content: "The user is asking for specific details about a restaurant. If you don't have this information in the provided restaurant data, acknowledge this limitation transparently rather than providing general recommendations."
      });
    }
    
    // Check if the user's query is off-topic (i.e. not about restaurants or food)
    const isOffTopic = (() => {
      const restaurantKeywords = [
        'food', 'restaurant', 'eat', 'dining', 'lunch', 'dinner', 'breakfast', 'brunch',
        'cuisine', 'hungry', 'menu', 'meal', 'place', 'pizza', 'burger', 'sushi', 'salad'
      ];
      
      const offTopicKeywords = [
        'weather', 'sports', 'news', 'school', 'homework', 'class', 'study',
        'politics', 'science', 'math', 'history', 'geography', 'health', 'exercise',
        'movie', 'film', 'tv', 'show', 'game', 'play', 'book', 'read'
      ];
      
      // Determine if the user's input contains restaurant-related keywords
      const hasRestaurantKeyword = restaurantKeywords.some(keyword => 
        userInput.toLowerCase().includes(keyword)
      );
      
      if (hasRestaurantKeyword) return false;
      
      // Check if the input contains any off-topic keywords
      const hasOffTopicKeyword = offTopicKeywords.some(keyword => 
        userInput.toLowerCase().includes(keyword)
      );
      
      // Special exception: if "hotel" is mentioned, consider it on-topic
      if (userInput.toLowerCase().includes('hotel')) return false;
      
      return hasOffTopicKeyword;
    })();
    
    // If the query is off-topic, add a system message to steer the conversation back to restaurant recommendations
    if (isOffTopic) {
      messages.push({
        role: "system",
        content: "The user is asking about a topic unrelated to restaurants or food. Remind them politely that you are specifically designed to help with restaurant recommendations, and then steer the conversation back to food-related topics."
      });
    }
    
    // Add a system message containing the formatted restaurant data for reference
    messages.push({
      role: "system",
      content: `
      Here are some restaurant options nearby: ${JSON.stringify(formattedRestaurants)}
      
      IMPORTANT: When the user asks about specific details like exact business hours, detailed menu items, or exact ratings that are not included in the data above, acknowledge that you don't have that specific information rather than providing general recommendations. Be transparent about what information you do and don't have.
      
      REMEMBER TO FORMAT RESTAURANT NAMES WITH THEIR EMOJI ON BOTH SIDES, LIKE THIS: "🍕 Tony's Pizza Napoletana 🍕" NOT WITH ASTERISKS.
      `
    });
    
    // Add a critical formatting reminder to ensure the correct display of restaurant names
    messages.push({
      role: "system",
      content: "CRITICAL FORMATTING REMINDER: DO NOT use markdown format with asterisks like **Restaurant Name**. INSTEAD, use the emoji format where the restaurant's appropriate cuisine emoji appears on both sides of the name, like: 🍕 Tony's Pizza Napoletana 🍕. This is extremely important as markdown formatting does not display correctly in the user interface."
    });
    
    // Append the current user's message to the conversation
    messages.push({
      role: "user",
      content: userInput
    });

    // Log the total number of messages being sent to OpenAI for debugging
    console.log("Sending request to OpenAI with message count:", messages.length);

    // In development mode, provide fallback responses if the API key is missing
    if (process.env.NODE_ENV === 'development' && !OPENAI_API_KEY) {
      console.log("Using fallback response in development mode");
      if (userInput.toLowerCase().includes("burger")) {
        return "Here are some great burger places I can recommend:\n\n🍔 Burger Joint 🍔: Located at 700 Haight Street, this restaurant has a rating of 4.5. This popular American eatery excels at elevated comfort food classics that satisfy both nostalgia and modern tastes. Their juicy, made-to-order burgers feature high-quality beef patties and a variety of creative toppings that locals can't stop raving about. The wallet-friendly prices make it a great value spot for satisfying meals without breaking the bank. They're currently open and ready to welcome hungry diners.\n\n🍔 Gourmet Grill 🍔: Located at 5 Embarcadero Center, this restaurant has a rating of 4.4. This upscale burger destination takes the humble hamburger to new heights with premium Wagyu beef, artisanal buns, and innovative topping combinations. Each burger is cooked to perfection and assembled with artistic precision for a truly memorable dining experience. The somewhat higher prices reflect the quality ingredients, skilled preparation, and elevated dining experience.\n\n🍔 Fast Patty 🍔: Located at 346 Kearny Street, this restaurant has a rating of 4.1. This beloved quick-service spot has perfected the art of the smash burger, creating thin patties with irresistibly crispy edges and juicy centers. Their simple but delicious approach focuses on quality ingredients and classic flavor combinations that never disappoint burger enthusiasts. The wallet-friendly prices make it a great value spot for satisfying meals without breaking the bank.\n\n🍔 Burger Bar 🍔: Located at 251 Geary Street, this restaurant has a rating of 4.3. This trendy burger establishment brings global influence to the American classic with internationally-inspired flavor profiles and house-made condiments. The creative menu offers everything from traditional cheeseburgers to bold fusion creations that push culinary boundaries. With reasonable prices and generous portions, it offers a solid balance of quality and value. They're currently open and ready to welcome hungry diners.\n\nFrom quick-service smash burgers to gourmet creations with premium ingredients, these spots offer something for every burger lover! 🍔🍟\n\nWould you like me to narrow down these options based on price, location, or any specific burger style you're craving?";
      } else if (userInput.toLowerCase().includes("pizza")) {
        return "Here are some excellent pizza places nearby to satisfy your cravings:\n\n🍕 Tony's Pizza Napoletana 🍕: Located at 1570 Stockton Street, this restaurant has a rating of 4.5. This beloved pizza spot is famous for its perfectly crafted pies with crispy-yet-chewy crusts and creative toppings. From classic Margherita to innovative specialty combinations, their wood-fired ovens turn out some of the most delicious and authentic Neapolitan pizza in town. With reasonable prices and generous portions, it offers a solid balance of quality and value. They're currently open and ready to welcome hungry diners.\n\n🍕 Dough Masters 🍕: Located at 325 Columbus Avenue, this restaurant has a rating of 4.3. This pizza haven specializes in Chicago-style deep dish masterpieces with buttery, flaky crusts that cradle layers of premium cheese, toppings, and sauce. Each pie is a hearty meal that showcases the perfect balance of textures and flavors that deep dish aficionados crave. The wallet-friendly prices make it a great value spot for satisfying meals without breaking the bank.\n\n🍕 Artisan Pizza Co. 🍕: Located at 780 Valencia Street, this restaurant has a rating of 4.4. This trendy pizzeria marries traditional techniques with modern culinary sensibilities, creating artisanal pies featuring locally sourced ingredients and unexpected flavor combinations. The thin, blistered crusts from their wood-fired oven provide the perfect canvas for their creative toppings and house-made sauces. The somewhat higher prices reflect the quality ingredients, skilled preparation, and elevated dining experience.\n\n🍕 Slice of New York 🍕: Located at 535 Mission Street, this restaurant has a rating of 4.2. This authentic New York-style pizzeria captures the essence of East Coast slice culture with thin, foldable crusts, quality toppings, and the perfect ratio of sauce to cheese. Their giant slices satisfy even the heartiest appetites, and their whole pies are perfect for sharing with friends or family. The wallet-friendly prices make it a great value spot for satisfying meals without breaking the bank. They're currently open and ready to welcome hungry diners.\n\nFrom authentic Neapolitan and Chicago deep dish to New York thin crust and artisanal creations, these fantastic pizzerias offer every style a pizza lover could desire! 🍕🧀\n\nDo you have a preference for thin crust or deep dish pizza? Or would you like to know more about any of these delicious options?";
      } else if (userInput.toLowerCase().includes("weather")) {
        return "I'm your AI restaurant assistant, so I don't have current weather information. However, I'd be happy to recommend some great places to eat! Would you prefer indoor dining if it might be cold or rainy, or perhaps a place with outdoor seating if the weather looks nice? 🍽️ What kind of food are you in the mood for today? 😊";
      } else {
        return "I'd be happy to suggest some restaurants nearby! Here are five excellent options with various cuisines:\n\n🦞 Waterbar Restaurant 🦞: Located at 399 The Embarcadero, this restaurant has a rating of 4.5. This outstanding seafood destination showcases the freshest catches prepared with skill and creativity. From simply grilled fish that lets the ocean flavors shine to elaborate seafood platters and specialty dishes, it's a paradise for lovers of fruits de mer. The stunning waterfront views provide a perfect backdrop for enjoying your meal, making it ideal for both special occasions and casual dining. The somewhat higher prices reflect the quality ingredients, skilled preparation, and elevated dining experience.\n\n🍲 Burma Superstar 🍲: Located at 309 Clement Street, this restaurant has a rating of 4.6. This beloved Burmese restaurant introduces diners to the unique flavors of Myanmar's diverse culinary landscape. Their tea leaf salad is legendary, and their curries, noodle dishes, and rice plates offer a delicious fusion of influences from neighboring Thailand, India, and China. The vibrant, aromatic dishes balance spicy, sour, and savory elements in perfect harmony. With reasonable prices and generous portions, it offers a solid balance of quality and value.\n\n🫒 Kokkari Estiatorio 🫒: Located at 280 Jackson Street, this restaurant has a rating of 4.7. This elegant Greek restaurant creates Mediterranean masterpieces using traditional recipes and techniques. From tender, herb-infused grilled meats cooked over open flames to fresh seafood, vegetable mezze, and hearty moussaka, every dish captures the essence of Greek culinary tradition. The rustic-luxe interior with wood-beam ceilings and a large fireplace creates a warm, inviting atmosphere. The premium prices are justified by the exceptional quality, expert preparation, and luxurious dining experience.\n\n🌮 La Taqueria 🌮: Located at 2889 Mission Street, this restaurant has a rating of 4.5. This iconic Mission District taqueria has earned its reputation for serving some of the most authentic and delicious Mexican street food in the city. Their burritos and tacos feature perfectly seasoned meats, fresh ingredients, and house-made salsas that capture the true essence of traditional Mexican flavors. The no-frills setting puts all the focus on the food, which speaks for itself with every bite. The wallet-friendly prices make it a great value spot for satisfying meals without breaking the bank.\n\n🍽️ State Bird Provisions 🍽️: Located at 1529 Fillmore Street, this restaurant has a rating of 4.4. This innovative American restaurant has revolutionized dining with its creative dim-sum style service that brings a parade of small plates directly to your table. The ever-changing menu showcases seasonal California ingredients in surprising, delightful combinations that push culinary boundaries while remaining deeply satisfying. The lively, convivial atmosphere adds to the unique dining experience. The somewhat higher prices reflect the quality ingredients, skilled preparation, and elevated dining experience.\n\nFrom fresh seafood with waterfront views to authentic international cuisines and innovative American fare, these restaurants offer diverse culinary experiences to satisfy any craving! 🌟🍽️\n\nWhat type of cuisine are you in the mood for today?";
      }
    }

    // Send a POST request to the OpenAI Chat Completions API with the built messages array
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo', // Specify the model to use (gpt-3.5-turbo for cost efficiency)
          messages: messages,     // Include the complete conversation context
          temperature: 0.8,       // Set temperature for creative responses
          max_tokens: 1000        // Set a higher token limit for detailed descriptions
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
  
      // Log receipt of a successful response from OpenAI
      console.log("Received response from OpenAI");
      // Return the content of the first choice's message from the response
      return response.data.choices[0].message.content;
    } catch (apiError) {
      // Log error details if the API request fails
      console.error("API request error:", apiError);
      
      if (apiError.response) {
        console.error("API error response:", apiError.response.data);
        console.error("Status code:", apiError.response.status);
        
        // Provide specific error messages based on HTTP status codes
        if (apiError.response.status === 401) {
          return "I can't access my restaurant brain right now. There seems to be an authentication issue with my API key. 🔑";
        }
        if (apiError.response.status === 429) {
          return "I've reached my limit for restaurant searches at the moment. Please try again in a minute. ⏱️";
        }
      }
      
      // In development mode, provide a fallback response if the API call fails
      if (process.env.NODE_ENV === 'development') {
        console.log("Using fallback response for API error");
        return "I'd be happy to help you find some great restaurants! 🍽️ What kind of cuisine are you in the mood for today? (Note: This is a fallback response because the API call failed)";
      }
      
      // Re-throw the error if not handled above
      throw apiError;
    }
  } catch (error) {
    // Log any errors encountered in the outer try block
    console.error('Error in fetchChatbotResponse:', error);
    // Return a generic error message to the user
    return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. 🙁";
  }
};

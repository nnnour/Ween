// Import React hooks for managing state and side effects
import { useState, useEffect } from 'react';

/**
 * A custom hook to manage conversation memory and context
 * This provides better context awareness for the chatbot
 */
const useConversationMemory = () => {
  // Log initialization for debugging purposes
  console.log("useConversationMemory initialized");
  
  // State to hold the entire conversation history as an array of context objects
  const [conversationContext, setConversationContext] = useState([]);

  // State to hold various aspects of user memory/preferences extracted from the conversation
  const [userMemory, setUserMemory] = useState({
    likedCuisines: [],
    dislikedCuisines: [],
    dietaryRestrictions: [],
    preferredPriceRange: null,
    preferredAmbiance: null,
    favoriteMentionedRestaurants: [],
    rejectedRestaurants: []
  });

  // Function to update the memory based on user input and AI responses
  const updateMemory = (userInput, aiResponse) => {
    // Convert user input to lower case for case-insensitive matching
    const lowerUserInput = userInput.toLowerCase();
    // Note: lowerAiResponse is not declared since it's not directly used

    // Define a list of cuisine types to search for in the user's input
    const cuisineTypes = ['italian', 'chinese', 'indian', 'mexican', 'japanese', 'thai', 'burger', 'pizza'];
    // Define patterns indicating positive sentiment toward a cuisine
    const likePatterns = ['like', 'love', 'enjoy', 'prefer', 'want', 'looking for', 'craving'];
    
    // Loop through each cuisine to detect if the user has expressed liking it
    cuisineTypes.forEach(cuisine => {
      if (lowerUserInput.includes(cuisine) && 
          likePatterns.some(pattern => lowerUserInput.includes(pattern))) {
        // If cuisine is not already in likedCuisines, update memory
        if (!userMemory.likedCuisines.includes(cuisine)) {
          setUserMemory(prev => ({
            ...prev,
            likedCuisines: [...prev.likedCuisines, cuisine]
          }));
        }
      }
    });

    // Define patterns indicating negative sentiment toward a cuisine
    const dislikePatterns = ['don\'t like', 'hate', 'not a fan', 'dislike', 'anything but'];
    // Loop through each cuisine to detect if the user has expressed disliking it
    cuisineTypes.forEach(cuisine => {
      if (lowerUserInput.includes(cuisine) && 
          dislikePatterns.some(pattern => lowerUserInput.includes(pattern))) {
        // Update memory if the cuisine is not already marked as disliked
        if (!userMemory.dislikedCuisines.includes(cuisine)) {
          setUserMemory(prev => ({
            ...prev,
            dislikedCuisines: [...prev.dislikedCuisines, cuisine]
          }));
        }
      }
    });

    // Define a list of dietary restrictions to search for in the user's input
    const dietaryRestrictions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut allergy'];
    // Check each dietary restriction and update memory if found
    dietaryRestrictions.forEach(restriction => {
      if (lowerUserInput.includes(restriction)) {
        if (!userMemory.dietaryRestrictions.includes(restriction)) {
          setUserMemory(prev => ({
            ...prev,
            dietaryRestrictions: [...prev.dietaryRestrictions, restriction]
          }));
        }
      }
    });

    // Detect price preferences based on key words and update memory accordingly
    if (lowerUserInput.includes('cheap') || lowerUserInput.includes('inexpensive') || 
        lowerUserInput.includes('affordable')) {
      setUserMemory(prev => ({ ...prev, preferredPriceRange: 'low' }));
    } else if (lowerUserInput.includes('moderate') || lowerUserInput.includes('mid-range')) {
      setUserMemory(prev => ({ ...prev, preferredPriceRange: 'moderate' }));
    } else if (lowerUserInput.includes('expensive') || lowerUserInput.includes('high-end') ||
               lowerUserInput.includes('fancy')) {
      setUserMemory(prev => ({ ...prev, preferredPriceRange: 'high' }));
    }

    // Detect ambiance preferences based on keywords and update memory
    if (lowerUserInput.includes('quiet') || lowerUserInput.includes('romantic') || 
        lowerUserInput.includes('intimate')) {
      setUserMemory(prev => ({ ...prev, preferredAmbiance: 'quiet' }));
    } else if (lowerUserInput.includes('lively') || lowerUserInput.includes('energetic') || 
               lowerUserInput.includes('bustling')) {
      setUserMemory(prev => ({ ...prev, preferredAmbiance: 'lively' }));
    } else if (lowerUserInput.includes('family') || lowerUserInput.includes('kid-friendly')) {
      setUserMemory(prev => ({ ...prev, preferredAmbiance: 'family-friendly' }));
    }

    // Function to extract potential restaurant names from text using a simple regex pattern
    const extractRestaurantNames = (text) => {
      // Look for words that start with a capital letter possibly followed by lowercase letters and an optional possessive 's
      const possibleNames = text.match(/\b[A-Z][a-z]+(?:'s)?\b/g) || [];
      return possibleNames;
    };

    // Extract restaurant names mentioned in bold from the AI response (assumes markdown ** formatting)
    const boldTextMatches = aiResponse.match(/\*\*(.*?)\*\*/g) || [];
    const boldRestaurants = boldTextMatches.map(match => match.replace(/\*\*/g, ''));
    
    // Combine restaurant names extracted from user input and bolded names from AI response
    const possibleRestaurants = [...extractRestaurantNames(userInput), ...boldRestaurants];
    if (possibleRestaurants.length > 0) {
      // Define negation patterns to detect if a restaurant was mentioned negatively
      const negationPatterns = ['don\'t like', 'not', 'didn\'t enjoy'];
      
      // If any negation patterns are found, add the restaurant(s) to the rejected list
      if (negationPatterns.some(pattern => lowerUserInput.includes(pattern))) {
        possibleRestaurants.forEach(restaurant => {
          if (!userMemory.rejectedRestaurants.includes(restaurant)) {
            setUserMemory(prev => ({
              ...prev,
              rejectedRestaurants: [...prev.rejectedRestaurants, restaurant]
            }));
          }
        });
      } else {
        // Otherwise, add the restaurant(s) to the favorites/mentioned list
        possibleRestaurants.forEach(restaurant => {
          if (!userMemory.favoriteMentionedRestaurants.includes(restaurant)) {
            setUserMemory(prev => ({
              ...prev,
              favoriteMentionedRestaurants: [...prev.favoriteMentionedRestaurants, restaurant]
            }));
          }
        });
      }
    }
  };

  // Function to generate a summary of the current conversation context based on the accumulated memory
  const generateContextSummary = () => {
    let summary = "Based on our conversation, I understand that:";
    
    // Append summary details if liked cuisines exist
    if (userMemory.likedCuisines.length > 0) {
      summary += ` You enjoy ${userMemory.likedCuisines.join(', ')} cuisine.`;
    }
    
    // Append disliked cuisines if any exist
    if (userMemory.dislikedCuisines.length > 0) {
      summary += ` You don't prefer ${userMemory.dislikedCuisines.join(', ')} cuisine.`;
    }
    
    // Append dietary restrictions if present
    if (userMemory.dietaryRestrictions.length > 0) {
      summary += ` You have dietary preferences/restrictions: ${userMemory.dietaryRestrictions.join(', ')}.`;
    }
    
    // Append preferred price range if set
    if (userMemory.preferredPriceRange) {
      summary += ` You prefer ${userMemory.preferredPriceRange} price range restaurants.`;
    }
    
    // Append ambiance preference if set
    if (userMemory.preferredAmbiance) {
      summary += ` You enjoy ${userMemory.preferredAmbiance} ambiance.`;
    }
    
    // Append rejected restaurants if any were mentioned negatively
    if (userMemory.rejectedRestaurants.length > 0) {
      summary += ` You weren't interested in ${userMemory.rejectedRestaurants.join(', ')}.`;
    }
    
    return summary;
  };

  // useEffect to update the conversation context whenever the user memory changes
  useEffect(() => {
    // Check if any memory value has meaningful content
    if (Object.values(userMemory).some(value => 
        Array.isArray(value) ? value.length > 0 : value !== null)) {
      
      // Generate a summary of the current memory
      const contextSummary = generateContextSummary();
      
      // Only add the summary if it has sufficient length
      if (contextSummary.length > 30) {
        // Check if a memory summary already exists in the conversation context
        const hasMemorySummary = conversationContext.some(
          ctx => ctx.role === "system" && ctx.content.startsWith("Based on our conversation")
        );
        
        if (hasMemorySummary) {
          // Update the existing memory summary within the conversation context
          setConversationContext(prev => 
            prev.map(ctx => 
              (ctx.role === "system" && ctx.content.startsWith("Based on our conversation"))
                ? { ...ctx, content: contextSummary }
                : ctx
            )
          );
        } else {
          // Otherwise, add a new memory summary to the conversation context
          setConversationContext(prev => [
            ...prev, 
            { role: "system", content: contextSummary }
          ]);
        }
      }
    }
  // Disable exhaustive-deps warning to avoid infinite loops, as conversationContext is updated within the effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userMemory]);

  // Return the conversation context and functions to update it
  return {
    conversationContext,
    setConversationContext,
    updateMemory
  };
};

// Export the custom hook for use in other parts of the application
export default useConversationMemory;

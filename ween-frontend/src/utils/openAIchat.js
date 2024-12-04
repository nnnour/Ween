import axios from "axios";

// Get the OpenAI API Key from environment variables
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

/**
 * Fetch chatbot response from OpenAI API
 * @param {Array} restaurantList - List of restaurant names and descriptions.
 * @returns {string} - Generated text with restaurant descriptions.
 */
export const fetchChatbotResponse = async (restaurantList) => {
  const prompt = `Provide a fun description of the following restaurants:
  ${restaurantList.map((r) => `- ${r.name}: ${r.description}`).join("\n")}`;

  const maxRetries = 3; // Maximum number of retries

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const retryDelay = 1000 * Math.pow(2, attempt - 1); // Calculate retry delay (1s, 2s, 4s, etc.)
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
          max_tokens: 300, // Adjust based on output length
          temperature: 0.8, // Adjust creativity
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      return response.data.choices[0].message.content; // Return the response text
    } catch (error) {
      if (error.response && error.response.status === 429 && attempt < maxRetries) {
        console.warn(`Rate limit hit. Retrying in ${retryDelay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
      } else {
        console.error("Error fetching chatbot response from OpenAI:", error);
        throw new Error("Failed to fetch chatbot response.");
      }
    }
  }
};

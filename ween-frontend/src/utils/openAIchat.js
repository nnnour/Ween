import axios from "axios";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const fetchChatbotResponse = async ({ userInput, restaurants, preferences }) => {
  const prompt = `You are a helpful assistant that suggests restaurants based on user preferences. The user has asked: "${userInput}". Here are some nearby restaurants: ${restaurants
    .map((r) => `- ${r.name}: ${r.vicinity}, Rating: ${r.rating}, Types: ${r.types?.join(", ")}`)
    .join("\n")}. The user's preferences are: Cuisine - ${preferences.cuisine || "Any"}, Price Range - ${preferences.priceRange || "Any"}, Distance - ${preferences.distance || "Any"}. Provide a helpful response. Format the response with clear paragraphs and bullet points.`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that suggests restaurants. Format responses with clear paragraphs and bullet points." },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.8,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching chatbot response:", error);
    return "Sorry, I couldn’t process your request. Please try again.";
  }
};
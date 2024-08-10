import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const apiKey = import.meta.env.VITE_API_KEY;

  if (!apiKey) {
    throw new Error('API key is not set in environment variables.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const sendMessage = async () => {
    if (input.trim()) {
      // Append the user's message to the chat
      setMessages([...messages, { sender: 'user', text: input }]);

      // Clear the input field
      setInput('');

      try {
        const prompt = `
        The user says: "${input}".
        Respond conversationally.
        `;

        const response = await model.generateContent(prompt);
        const botMessage = response.response.text();

        // Append the bot's response to the chat
        setMessages([...messages, { sender: 'user', text: input }, { sender: 'bot', text: botMessage }]);
      } catch (error) {
        console.error('Error interacting with Gemini:', error);
        setMessages([...messages, { sender: 'user', text: input }, { sender: 'bot', text: "Sorry, I couldn't process your request." }]);
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;

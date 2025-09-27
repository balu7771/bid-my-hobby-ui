import React, { useState, useEffect } from 'react';

const ChatWithHobbyAI = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      try {
        const response = await fetch('http://localhost:8080/chat', { // Replace with your actual API endpoint
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputMessage }),
        });

        if (response.ok) {
          const data = await response.json();
          setMessages([...messages, { text: inputMessage, sender: 'user' }, { text: data.response, sender: 'ai' }]);
          setInputMessage('');
        } else {
          console.error('Failed to send message:', response.status);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
export default ChatWithHobbyAI;

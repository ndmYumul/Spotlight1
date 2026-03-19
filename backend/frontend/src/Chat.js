import React, { useState, useEffect, useRef } from 'react';
import './Chat.css'; // Ensure your CSS file is imported

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // 1. Add User Message to UI
        const userMsg = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        
        const currentInput = input;
        setInput(""); // Clear input immediately
        setIsLoading(true); // Trigger the "Thinking" state

        try {
            // Get token from your local storage (adjust key if yours is different)
            const userInfo = localStorage.getItem('userInfo');
            const token = userInfo ? JSON.parse(userInfo).token : null;

            const response = await fetch('http://127.0.0.1:8000/api/chatbot/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: currentInput })
            });

            const data = await response.json();

            // 2. Add AI Response to UI
            setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                text: "I'm having trouble connecting to the server. 🚧", 
                sender: 'bot' 
            }]);
        } finally {
            setIsLoading(false); // End loading state
        }
    };

    const handleClear = async () => {
        if (!window.confirm("Clear our conversation history?")) return;
        
        try {
            const userInfo = localStorage.getItem('userInfo');
            const token = userInfo ? JSON.parse(userInfo).token : null;

            await fetch('http://127.0.0.1:8000/api/chatbot/clear/', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessages([]);
        } catch (err) {
            console.error("Failed to clear chat:", err);
        }
    };

    return (
        <>
            {/* The Floating Action Button */}
            <button 
                className={`chat-fab ${isDrawerOpen ? 'drawer-open' : ''}`}
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            >
                {isDrawerOpen ? '✖' : '💬'}
            </button>

            {/* The Chat Drawer */}
            <div className={`chat-drawer ${isDrawerOpen ? 'open' : ''}`}>
                <div className="chat-header">
                    <span>Spotlight AI</span>
                    <button className="reset-btn" onClick={handleClear}>Clear History</button>
                </div>

                <div className="messages-window">
                    {messages.length === 0 && (
                        <div className="message bot">
                            Hi! I can help you book or cancel parking spots for the week. How can I help?
                        </div>
                    )}
                    
                    {messages.map((m, i) => (
                        <div key={i} className={`message ${m.sender}`}>
                            {m.text}
                        </div>
                    ))}

                    {/* The Pulse "Thinking" Indicator */}
                    {isLoading && (
                        <div className="message bot thinking">
                            Spotlight is thinking<span>.</span><span>.</span><span>.</span>
                        </div>
                    )}
                    
                    <div ref={scrollRef} />
                </div>

                <div className="input-area">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isLoading ? "Please wait..." : "Type a message..."}
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? "..." : "Send"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default Chat;
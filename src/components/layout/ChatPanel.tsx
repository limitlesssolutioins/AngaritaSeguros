'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ChatPanel.module.css';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hola, ¿en qué puedo ayudarte hoy?', sender: 'bot' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = { text: inputMessage, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from bot');
      }

      const data = await response.json();
      const botMessage: Message = { text: data.reply, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { text: 'Lo siento, algo salió mal. Por favor, intenta de nuevo.', sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.chatPanelContainer} ${isOpen ? styles.isOpen : ''}`}>
      <div className={styles.chatHeader}>
        <h3>Habla con nuestro Agente</h3>
        <button onClick={onClose} className={styles.closeButton}>
          <FaTimes />
        </button>
      </div>
      <div className={styles.chatMessages}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.messageBubble} ${styles[msg.sender]}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
            <div className={`${styles.messageBubble} ${styles.bot} ${styles.loading}`}>
                <span>.</span><span>.</span><span>.</span>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className={styles.chatInput}
          disabled={isLoading}
        />
        <button type="submit" className={styles.sendButton} disabled={isLoading}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}

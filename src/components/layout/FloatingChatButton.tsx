'use client';

import { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import styles from './FloatingChatButton.module.css';

interface FloatingChatButtonProps {
  onOpenChat: () => void;
}

export default function FloatingChatButton({ onOpenChat }: FloatingChatButtonProps) {
  const [showMessage, setShowMessage] = useState(true);

  // Hide message after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 5000); // Message disappears after 5 seconds
    return () => clearTimeout(timer);
  }, []); // Run only once on mount

  return (
    <div className={styles.fabContainer}>
      {showMessage && (
        <div className={styles.chatBubble}>
          Habla con nuestro Agente
        </div>
      )}
      <button className={styles.fabButton} onClick={onOpenChat}>
        <FaUserCircle className={styles.fabIcon} />
      </button>
    </div>
  );
}

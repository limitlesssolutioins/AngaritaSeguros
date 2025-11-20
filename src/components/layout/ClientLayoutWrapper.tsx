'use client';

import { useState } from 'react';
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingChatButton from "./FloatingChatButton";
import ChatPanel from "./ChatPanel";
import styles from '../../app/layout.module.css'; // Adjust path as needed

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);

  return (
    <>
      <div className={styles.body}>
        <Navbar />
        <main className={styles.main}>
          {children}
        </main>
        <Footer />
      </div>
      <FloatingChatButton onOpenChat={() => setIsChatPanelOpen(true)} />
      <ChatPanel isOpen={isChatPanelOpen} onClose={() => setIsChatPanelOpen(false)} />
    </>
  );
}

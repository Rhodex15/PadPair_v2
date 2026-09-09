import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "../utils/storage";
import { useAuth } from "./AuthContext";

const MessagesContext = createContext(null);

/**
 * Conversations are stored per-account (localStorage key "messages:<userId>"),
 * not in one global pool — otherwise every account on the same browser would
 * see every conversation. When a message is sent to another *real* account
 * (a signed-up landlord or tenant), it's written into both the sender's own
 * thread and directly into the recipient's stored mailbox, so logging in as
 * that person later shows the message waiting — simulating a real inbox
 * without a server. Messages to seeded placeholder characters (roommates,
 * or a listing with no real owner) only ever live in the sender's thread,
 * since there's no real account on the other end to deliver to.
 */
export function MessagesProvider({ children }) {
  const { user, isRegisteredUser } = useAuth();
  const storageKey = user ? `messages:${user.id}` : null;

  const [conversations, setConversations] = useState(() => (storageKey ? loadState(storageKey, {}) : {}));

  // Reload from this account's own mailbox whenever the logged-in user changes.
  useEffect(() => {
    setConversations(storageKey ? loadState(storageKey, {}) : {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (storageKey) saveState(storageKey, conversations);
  }, [storageKey, conversations]);

  // party: { id, name, avatar }
  const getOrCreateConversation = (party) => {
    if (conversations[party.id]) return conversations[party.id];
    const fresh = { id: party.id, name: party.name, avatar: party.avatar ?? null, messages: [] };
    setConversations((prev) => ({ ...prev, [party.id]: fresh }));
    return fresh;
  };

  const sendMessage = (conversationId, text) => {
    if (!user) return;
    const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const message = { id: Date.now(), text, time, senderId: user.id };

    setConversations((prev) => {
      const convo = prev[conversationId] ?? { id: conversationId, name: "", avatar: null, messages: [] };
      return { ...prev, [conversationId]: { ...convo, messages: [...convo.messages, message] } };
    });

    if (isRegisteredUser(conversationId)) {
      const recipientKey = `messages:${conversationId}`;
      const recipientConvos = loadState(recipientKey, {});
      const myThreadFromTheirSide = recipientConvos[user.id] ?? { id: user.id, name: user.name, avatar: user.avatar, messages: [] };
      recipientConvos[user.id] = { ...myThreadFromTheirSide, messages: [...myThreadFromTheirSide.messages, message] };
      saveState(recipientKey, recipientConvos);
    }
  };

  const conversationList = Object.values(conversations).sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1];
    const bLast = b.messages[b.messages.length - 1];
    return (bLast?.id ?? 0) - (aLast?.id ?? 0);
  });

  return (
    <MessagesContext.Provider value={{ conversations, conversationList, getOrCreateConversation, sendMessage }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}

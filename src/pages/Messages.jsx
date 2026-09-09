import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import ConversationListItem from "../components/ConversationListItem";
import ChatBubble from "../components/ChatBubble";
import { useMessages } from "../context/MessagesContext";
import { useAuth } from "../context/AuthContext";

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { conversationList, conversations, sendMessage } = useMessages();
  const { user } = useAuth();
  const [draft, setDraft] = useState("");

  const activeId = conversationId ?? conversationList[0]?.id;
  const activeConversation = activeId ? conversations[activeId] : null;

  const handleSend = () => {
    if (!draft.trim() || !activeConversation) return;
    sendMessage(activeConversation.id, draft.trim());
    setDraft("");
  };

  if (conversationList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center px-margin-mobile">
        <Icon name="chat_bubble" size={48} className="text-on-surface-variant" />
        <p className="font-body-lg text-body-lg text-on-surface-variant">No conversations yet.</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Message a landlord from a listing, or a roommate from a match, to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-64px-64px)] md:h-[calc(100dvh-64px)] max-w-container-max mx-auto md:border-x border-outline-variant">
      <aside className={`w-full md:w-80 lg:w-96 border-r border-outline-variant flex-col ${conversationId ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-outline-variant/20">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              className="w-full bg-surface-container-high border-none rounded-full py-2 pl-10 pr-4 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Search messages..."
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversationList.map((c) => {
            const last = c.messages[c.messages.length - 1];
            return (
              <ConversationListItem
                key={c.id}
                name={c.name}
                avatar={c.avatar}
                lastMessage={last?.text ?? "Say hello 👋"}
                time={last?.time ?? ""}
                active={c.id === activeId}
                onClick={() => navigate(`/messages/${c.id}`)}
              />
            );
          })}
        </div>
      </aside>

      {activeConversation && (
        <section className={`flex-1 flex-col bg-surface ${conversationId ? "flex" : "hidden md:flex"}`}>
          <header className="flex items-center gap-4 p-4 border-b border-outline-variant bg-surface-charcoal/80 backdrop-blur-md">
            <button onClick={() => navigate("/messages")} className="md:hidden text-on-surface-variant">
              <Icon name="arrow_back" />
            </button>
            <div className="relative">
              {activeConversation.avatar ? (
                <img src={activeConversation.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-headline-sm">
                  {activeConversation.name[0]}
                </div>
              )}
              {activeConversation.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-verified-green rounded-full border-2 border-surface-charcoal" />
              )}
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface leading-tight">{activeConversation.name}</h2>
              {activeConversation.online && <p className="font-label-sm text-label-sm text-primary">Online</p>}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
            {activeConversation.messages.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-8">
                No messages yet — say hello to {activeConversation.name.split(" ")[0]}.
              </p>
            ) : (
              activeConversation.messages.map((m) => (
                <ChatBubble key={m.id} text={m.text} time={m.time} isOwn={m.senderId === user?.id} avatar={activeConversation.avatar} />
              ))
            )}
          </div>

          <footer className="p-4 bg-surface-charcoal border-t border-outline-variant/20">
            <div className="flex items-end gap-2 bg-surface-container-high border border-outline-variant rounded-xl p-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <button aria-label="Attach" className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <Icon name="add_circle" />
              </button>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Type a message..."
                className="w-full bg-transparent border-none text-on-surface placeholder-on-surface-variant font-body-md text-body-md focus:ring-0 resize-none py-2"
              />
              <button
                onClick={handleSend}
                aria-label="Send"
                disabled={!draft.trim()}
                className="p-3 bg-secondary text-on-secondary rounded-lg hover:bg-sunset-orange transition-colors disabled:opacity-40 flex items-center justify-center"
              >
                <Icon name="send" filled />
              </button>
            </div>
          </footer>
        </section>
      )}
    </div>
  );
}

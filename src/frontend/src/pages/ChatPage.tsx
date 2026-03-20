import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Lock, Send, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { EncryptedMessage } from "../backend.d";
import {
  useGetChatInfo,
  useGetMessages,
  useSendMessage,
} from "../hooks/useQueries";
import {
  decryptMessage,
  encryptMessage,
  importEncryptionKey,
} from "../lib/crypto";
import { loadSession } from "../lib/session";

interface DecryptedMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: bigint;
  isOwn: boolean;
  failed: boolean;
}

export default function ChatPage() {
  const { chatId } = useParams({ from: "/chat/$chatId" });
  const navigate = useNavigate();
  const session = loadSession();
  const username = session.username || "";
  const keyBase64 = session.keyBase64 || "";

  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<
    DecryptedMessage[]
  >([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessageCount = useRef(0);

  // Redirect if no session
  useEffect(() => {
    if (!username || !keyBase64 || !chatId) {
      navigate({ to: "/" });
    }
  }, [username, keyBase64, chatId, navigate]);

  // Import crypto key
  useEffect(() => {
    if (!keyBase64) return;
    importEncryptionKey(keyBase64)
      .then(setCryptoKey)
      .catch(() => toast.error("Invalid encryption key"));
  }, [keyBase64]);

  const messagesQuery = useGetMessages(chatId, username, !!cryptoKey);
  const chatInfoQuery = useGetChatInfo(chatId, username, !!username);
  const sendMessage = useSendMessage();

  // Decrypt messages when they arrive
  useEffect(() => {
    if (!messagesQuery.data || !cryptoKey) return;
    const decrypt = async () => {
      const results = await Promise.all(
        messagesQuery.data.map(
          async (msg: EncryptedMessage): Promise<DecryptedMessage> => {
            try {
              const text = await decryptMessage(msg.ciphertext, cryptoKey);
              return {
                id: msg.id,
                text,
                senderId: msg.senderId,
                timestamp: msg.timestamp,
                isOwn: msg.senderId === username,
                failed: false,
              };
            } catch {
              return {
                id: msg.id,
                text: "[Decryption failed]",
                senderId: msg.senderId,
                timestamp: msg.timestamp,
                isOwn: msg.senderId === username,
                failed: true,
              };
            }
          },
        ),
      );
      setDecryptedMessages(results);
    };
    decrypt();
  }, [messagesQuery.data, cryptoKey, username]);

  // Auto-scroll on new messages
  useEffect(() => {
    const count = decryptedMessages.length;
    if (count > prevMessageCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCount.current = count;
  }, [decryptedMessages]);

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !cryptoKey || sending) return;
    const text = messageText.trim();
    setMessageText("");
    setSending(true);
    try {
      const ciphertext = await encryptMessage(text, cryptoKey);
      await sendMessage.mutateAsync({ chatId, username, ciphertext });
    } catch {
      toast.error("Failed to send message.");
      setMessageText(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [messageText, cryptoKey, sending, chatId, username, sendMessage]);

  const formatTime = (timestamp: bigint) => {
    const ms = Number(timestamp) / 1_000_000;
    const d = new Date(ms);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const participantCount = chatInfoQuery.data?.participants?.length ?? "—";

  return (
    <div className="phone-frame grain-overlay">
      <div className="flex flex-col h-dvh bg-background">
        {/* Chat header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="p-1.5 -ml-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Lock size={11} className="text-muted-foreground shrink-0" />
              <h1 className="font-display text-base font-semibold tracking-tight truncate">
                GhostChat
              </h1>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Users size={10} className="text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                {participantCount} participants
              </span>
            </div>
          </div>

          {/* Encryption indicator */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground border border-border px-2 py-1">
            <span className="w-1 h-1 rounded-full bg-foreground/60 animate-pulse" />
            E2E
          </div>
        </header>

        {/* Messages */}
        <div
          data-ocid="chat.list"
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="px-4 py-4 space-y-2 min-h-full flex flex-col justify-end">
            {/* Loading state */}
            {(messagesQuery.isLoading || !cryptoKey) && (
              <div
                data-ocid="chat.loading_state"
                className="flex items-center justify-center py-12"
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2
                    size={18}
                    className="animate-spin text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground tracking-widest uppercase">
                    {!cryptoKey ? "Loading key..." : "Loading messages..."}
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!messagesQuery.isLoading &&
              cryptoKey &&
              decryptedMessages.length === 0 && (
                <motion.div
                  data-ocid="chat.empty_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center px-8"
                >
                  <div className="text-4xl mb-4">👻</div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    No messages yet
                  </p>
                  <p className="text-[11px] text-muted-foreground/50">
                    Say hello to start the conversation.
                  </p>
                </motion.div>
              )}

            {/* Message list */}
            <AnimatePresence initial={false}>
              {decryptedMessages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  data-ocid={`chat.item.${idx + 1}`}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`flex flex-col ${
                    msg.isOwn ? "items-end" : "items-start"
                  }`}
                >
                  {/* Sender name for non-own messages */}
                  {!msg.isOwn && (
                    <span className="text-[10px] text-muted-foreground/60 mb-1 ml-1 tracking-wider uppercase">
                      {msg.senderId}
                    </span>
                  )}

                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 ${
                      msg.isOwn
                        ? "bg-foreground text-background"
                        : "bg-card text-foreground border border-border"
                    } ${msg.failed ? "opacity-50" : ""}`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {msg.text}
                    </p>
                  </div>

                  <span className="text-[9px] text-muted-foreground/40 mt-1 mx-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm chat-input-bar pt-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              data-ocid="chat.input"
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message..."
              autoComplete="off"
              disabled={!cryptoKey || sending}
              className="flex-1 bg-card border border-border text-foreground px-4 py-3 text-sm font-body placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/40 transition-colors disabled:opacity-50 min-h-[48px]"
            />
            <button
              type="button"
              data-ocid="chat.submit_button"
              onClick={handleSend}
              disabled={!messageText.trim() || !cryptoKey || sending}
              aria-label="Send"
              className="w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

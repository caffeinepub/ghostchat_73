import { Input } from "@/components/ui/input";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Copy, Loader2, Send, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  useGetGroupInfo,
  useGetGroupMessages,
  useSendGroupMessage,
} from "../hooks/useQueries";

interface SavedGroup {
  groupId: string;
  username: string;
  token: string;
  groupName: string;
}

function getSavedGroups(): SavedGroup[] {
  try {
    return JSON.parse(localStorage.getItem("ghostchat_groups") || "[]");
  } catch {
    return [];
  }
}

function saveGroup(group: SavedGroup) {
  const groups = getSavedGroups();
  const existing = groups.findIndex((g) => g.groupId === group.groupId);
  if (existing >= 0) {
    groups[existing] = group;
  } else {
    groups.push(group);
  }
  localStorage.setItem("ghostchat_groups", JSON.stringify(groups));
}

export default function GroupChatPage() {
  const navigate = useNavigate();
  const { groupId } = useParams({ from: "/group/$groupId" });

  const [username, setUsername] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [message, setMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Resolve username from localStorage
  useEffect(() => {
    const saved = getSavedGroups().find((g) => g.groupId === groupId);
    if (saved) {
      setUsername(saved.username);
    }
  }, [groupId]);

  const isActive = !!username;

  const { data: messages, isLoading: messagesLoading } = useGetGroupMessages(
    groupId,
    isActive,
  );
  const { data: groupInfo } = useGetGroupInfo(groupId, isActive);
  const sendMessage = useSendGroupMessage();

  // Auto-scroll
  useEffect(() => {
    if (messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const saved = getSavedGroups().find((g) => g.groupId === groupId);
    saveGroup({
      groupId,
      username: nameInput.trim(),
      token: saved?.token ?? "",
      groupName: saved?.groupName ?? groupInfo?.name ?? "",
    });
    setUsername(nameInput.trim());
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !username) return;
    const content = message.trim();
    setMessage("");
    try {
      await sendMessage.mutateAsync({ groupId, username, content });
    } catch {
      setMessage(content);
    }
  };

  const handleCopyLink = async () => {
    const saved = getSavedGroups().find((g) => g.groupId === groupId);
    const token = saved?.token;
    if (!token) return;
    const link = `${window.location.origin}/group-join/${token}`;
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Name entry overlay
  if (!username) {
    return (
      <div className="phone-frame grain-overlay">
        <main className="flex flex-col min-h-dvh bg-background">
          <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-border">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-display text-lg font-semibold text-foreground">
              Group Chat
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center px-5 py-8">
            <motion.form
              onSubmit={handleNameSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-5"
            >
              <p className="font-body text-sm text-muted-foreground">
                Enter your name to participate in this group.
              </p>
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className="bg-card border-border font-body text-foreground placeholder:text-muted-foreground/40 rounded-none h-12"
                autoFocus
              />
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="w-full bg-primary text-primary-foreground font-body text-sm font-medium tracking-wide h-12 uppercase transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
              >
                Enter
              </button>
            </motion.form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="phone-frame grain-overlay">
      <main className="flex flex-col h-dvh bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-border shrink-0">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-semibold text-foreground truncate">
              {groupInfo?.name ?? "Group"}
            </h1>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="font-body text-xs text-muted-foreground">
                {groupInfo?.participants?.length ?? 0} members
              </span>
            </div>
          </div>
          <button
            type="button"
            data-ocid="group_chat.share_button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors px-2 py-1 border border-border"
          >
            <Copy className="w-3.5 h-3.5" />
            {linkCopied ? "Copied!" : "Share"}
          </button>
        </div>

        {/* Messages */}
        <div
          data-ocid="group_chat.list"
          className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
        >
          {messagesLoading && (
            <div
              data-ocid="group_chat.loading_state"
              className="flex justify-center items-center py-12"
            >
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!messagesLoading && (!messages || messages.length === 0) && (
            <div
              data-ocid="group_chat.empty_state"
              className="flex flex-col items-center justify-center flex-1 py-16 gap-2"
            >
              <Users className="w-8 h-8 text-muted-foreground/30" />
              <p className="font-body text-sm text-muted-foreground">
                No messages yet
              </p>
              <p className="font-body text-xs text-muted-foreground/60">
                Be the first to say hello
              </p>
            </div>
          )}

          {messages?.map((msg, index) => {
            const isOwn = msg.senderId === username;
            return (
              <motion.div
                key={msg.id}
                data-ocid={`group_chat.item.${index + 1}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col gap-0.5 max-w-[80%] ${
                  isOwn ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {!isOwn && (
                  <span className="font-body text-xs text-muted-foreground px-1">
                    {msg.senderId}
                  </span>
                )}
                <div
                  className={`px-3 py-2 ${
                    isOwn
                      ? "bg-foreground text-background"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  <p className="font-body text-sm leading-relaxed">
                    {msg.content}
                  </p>
                </div>
                <span className="font-body text-[10px] text-muted-foreground/50 px-1">
                  {new Date(
                    Number(msg.timestamp) / 1_000_000,
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 px-4 py-3 border-t border-border shrink-0"
        >
          <Input
            data-ocid="group_chat.input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            className="flex-1 bg-card border-border font-body text-sm text-foreground placeholder:text-muted-foreground/40 rounded-none h-11"
          />
          <button
            type="submit"
            data-ocid="group_chat.submit_button"
            disabled={!message.trim() || sendMessage.isPending}
            className="bg-primary text-primary-foreground h-11 w-11 flex items-center justify-center transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-40"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

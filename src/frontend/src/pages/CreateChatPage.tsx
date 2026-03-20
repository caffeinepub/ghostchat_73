import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Check, Copy, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateChat } from "../hooks/useQueries";
import { generateEncryptionKey } from "../lib/crypto";
import { saveSession } from "../lib/session";

export default function CreateChatPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [chatId, setChatId] = useState("");
  const [copied, setCopied] = useState(false);
  const createChat = useCreateChat();

  const handleCreate = async () => {
    if (!username.trim()) return;
    try {
      const keyBase64 = await generateEncryptionKey();
      const [newChatId, token] = await createChat.mutateAsync(username.trim());
      const host = window.location.origin;
      const link = `${host}/join/${token}#${keyBase64}`;
      setChatId(newChatId);
      setInviteLink(link);
      saveSession(newChatId, username.trim(), keyBase64);
    } catch {
      toast.error("Failed to create chat. Please try again.");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleOpenChat = () => {
    navigate({ to: "/chat/$chatId", params: { chatId } });
  };

  return (
    <div className="phone-frame grain-overlay">
      <main className="flex flex-col min-h-dvh bg-background">
        {/* Header */}
        <header className="flex items-center px-5 py-4 border-b border-border">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <h2 className="font-display text-base font-medium tracking-tight ml-2">
            New Chat
          </h2>
        </header>

        <div className="flex-1 flex flex-col px-5 pt-8 pb-8">
          <AnimatePresence mode="wait">
            {!inviteLink ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-1"
              >
                <div className="mb-10">
                  <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">
                    Create Chat
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Choose a display name for this chat.
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="create-username"
                    className="block text-xs text-muted-foreground tracking-widest uppercase mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    id="create-username"
                    data-ocid="create.input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    placeholder="e.g. Alex"
                    maxLength={30}
                    autoComplete="off"
                    className="w-full bg-card text-foreground border border-border px-4 py-3.5 text-sm font-body placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/50 transition-colors"
                  />
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    data-ocid="create.submit_button"
                    onClick={handleCreate}
                    disabled={!username.trim() || createChat.isPending}
                    className="w-full bg-primary text-primary-foreground font-body text-sm font-medium tracking-wide py-4 px-8 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] uppercase disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {createChat.isPending ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />{" "}
                        Creating...
                      </>
                    ) : (
                      "Create Chat"
                    )}
                  </button>
                </div>

                {createChat.isError && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-destructive">
                    <AlertTriangle size={14} />
                    <span>Failed to create. Please try again.</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-1"
              >
                <div className="mb-8">
                  <div className="text-2xl mb-3">✓</div>
                  <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">
                    Chat Ready
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Share the link to invite someone.
                  </p>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2.5 bg-card border border-border p-4 mb-6">
                  <AlertTriangle
                    size={14}
                    className="text-foreground/50 mt-0.5 shrink-0"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground font-medium">
                      This link works only once.
                    </strong>{" "}
                    Share it directly with the person you want to invite.
                  </p>
                </div>

                {/* Invite link */}
                <div
                  data-ocid="create.link_panel"
                  className="bg-card border border-border p-4 mb-4"
                >
                  <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-2">
                    Invite Link
                  </p>
                  <p className="text-xs text-foreground/70 break-all font-mono leading-relaxed">
                    {inviteLink}
                  </p>
                </div>

                {/* Copy button */}
                <button
                  type="button"
                  data-ocid="create.copy_button"
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 border border-border text-foreground font-body text-sm font-medium tracking-wide py-3.5 px-8 transition-all duration-200 hover:bg-card active:scale-[0.98] uppercase mb-3"
                >
                  {copied ? (
                    <>
                      <Check size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Link
                    </>
                  )}
                </button>

                {/* Open chat */}
                <button
                  type="button"
                  data-ocid="create.open_chat_button"
                  onClick={handleOpenChat}
                  className="w-full bg-primary text-primary-foreground font-body text-sm font-medium tracking-wide py-4 px-8 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] uppercase"
                >
                  Open Chat
                </button>

                <p className="text-center text-[11px] text-muted-foreground/50 mt-6">
                  You can open the chat once someone has followed your invite
                  link.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

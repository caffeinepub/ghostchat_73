import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertTriangle, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCheckInviteToken, useJoinChat } from "../hooks/useQueries";
import { saveSession } from "../lib/session";

export default function JoinPage() {
  const { token } = useParams({ from: "/join/$token" });
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [keyBase64, setKeyBase64] = useState<string | null>(null);
  const [fragmentError, setFragmentError] = useState(false);

  // Extract encryption key from URL fragment
  useEffect(() => {
    const fragment = window.location.hash.slice(1);
    if (!fragment) {
      setFragmentError(true);
    } else {
      setKeyBase64(fragment);
    }
  }, []);

  const tokenCheck = useCheckInviteToken(token);
  const joinChat = useJoinChat();

  const handleJoin = async () => {
    if (!username.trim() || !keyBase64) return;
    try {
      const chatId = await joinChat.mutateAsync({
        token,
        username: username.trim(),
      });
      saveSession(chatId, username.trim(), keyBase64);
      navigate({ to: "/chat/$chatId", params: { chatId } });
    } catch {
      toast.error("Failed to join. The link may be invalid.");
    }
  };

  // Fragment error
  if (fragmentError) {
    return (
      <div className="phone-frame grain-overlay">
        <main className="flex flex-col min-h-dvh bg-background items-center justify-center px-8">
          <motion.div
            data-ocid="join.error_state"
            className="text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-3xl mb-4">🔑</div>
            <h2 className="font-display text-xl font-semibold mb-2">
              Invalid Link
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Encryption key missing. Please use the full invite link.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="mt-8 text-sm text-muted-foreground underline underline-offset-4"
            >
              Back to Home
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Token loading
  if (tokenCheck.isLoading) {
    return (
      <div className="phone-frame grain-overlay">
        <main className="flex flex-col min-h-dvh bg-background items-center justify-center">
          <motion.div
            data-ocid="join.loading_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground tracking-widest uppercase">
              Verifying link...
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  // Invalid / used token
  if (tokenCheck.data === false || tokenCheck.isError) {
    return (
      <div className="phone-frame grain-overlay">
        <main className="flex flex-col min-h-dvh bg-background items-center justify-center px-8">
          <motion.div
            data-ocid="join.error_state"
            className="text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-3xl mb-4">🚫</div>
            <h2 className="font-display text-xl font-semibold mb-2">
              Link Expired
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              This link has already been used or is no longer valid.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="mt-8 text-sm text-muted-foreground underline underline-offset-4"
            >
              Back to Home
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="phone-frame grain-overlay">
      <main className="flex flex-col min-h-dvh bg-background">
        {/* Header */}
        <header className="flex items-center px-5 py-4 border-b border-border">
          <h2 className="font-display text-base font-medium tracking-tight">
            Join Chat
          </h2>
        </header>

        <div className="flex-1 flex flex-col px-5 pt-8 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="join-form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col flex-1"
            >
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 mb-4 text-xs text-muted-foreground border border-border px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
                  Link valid
                </div>
                <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">
                  Join
                </h1>
                <p className="text-sm text-muted-foreground">
                  Choose a name to join the encrypted chat.
                </p>
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="join-username"
                  className="block text-xs text-muted-foreground tracking-widest uppercase mb-2"
                >
                  Your Name
                </label>
                <input
                  id="join-username"
                  data-ocid="join.input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  placeholder="e.g. Jordan"
                  maxLength={30}
                  autoComplete="off"
                  className="w-full bg-card text-foreground border border-border px-4 py-3.5 text-sm font-body placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/50 transition-colors"
                />
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  data-ocid="join.submit_button"
                  onClick={handleJoin}
                  disabled={
                    !username.trim() || joinChat.isPending || !keyBase64
                  }
                  className="w-full bg-primary text-primary-foreground font-body text-sm font-medium tracking-wide py-4 px-8 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] uppercase disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {joinChat.isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Joining...
                    </>
                  ) : (
                    "Join"
                  )}
                </button>
              </div>

              {joinChat.isError && (
                <div
                  data-ocid="join.error_state"
                  className="mt-4 flex items-center gap-2 text-xs text-destructive"
                >
                  <AlertTriangle size={14} />
                  <span>Failed to join. Please try again.</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

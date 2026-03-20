import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";
import { HelpCircle, MessageCircle, Shield, UserX, Users } from "lucide-react";
import { motion } from "motion/react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="phone-frame grain-overlay relative">
      {/* Help button */}
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            data-ocid="home.help_button"
            className="absolute top-4 right-4 z-20 w-7 h-7 rounded-full border border-border bg-background text-muted-foreground flex items-center justify-center hover:text-foreground hover:border-foreground transition-colors duration-200"
            aria-label="How it works"
          >
            <HelpCircle size={15} />
          </button>
        </DialogTrigger>
        <DialogContent
          data-ocid="home.dialog"
          className="bg-background border-border text-foreground max-w-sm mx-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-tight">
              How GhostChat Works
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5 py-2">
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                <MessageCircle size={18} className="text-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Private Chats</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Start a new chat and share the one-time link with someone. The
                  conversation is ephemeral — once both of you leave, it's gone
                  forever.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                <Users size={18} className="text-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Group Chats</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Create a group with a name and share the permanent invite
                  link. Anyone with the link can join anytime — chat history is
                  saved.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                <UserX size={18} className="text-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">No Account Needed</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Just enter your name and join via a link. No sign-up, no
                  registration, no password.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                <Shield size={18} className="text-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Privacy First</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  1-to-1 chats are never stored on the server. Your private
                  conversations stay private.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="flex flex-col min-h-dvh bg-background">
        {/* Top brand section */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-center px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground leading-none">
              Ghost
              <span className="text-muted-foreground">Chat</span>
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-sm text-muted-foreground tracking-widest uppercase mb-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            Private. Secure. Ephemeral.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="w-full max-w-sm flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <button
              type="button"
              data-ocid="home.primary_button"
              onClick={() => navigate({ to: "/create" })}
              className="w-full bg-primary text-primary-foreground font-body text-sm font-medium tracking-wide py-4 px-8 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] uppercase"
            >
              Start New Chat
            </button>
            <button
              type="button"
              data-ocid="home.group_button"
              onClick={() => navigate({ to: "/create-group" })}
              className="w-full bg-transparent text-foreground border border-border font-body text-sm font-medium tracking-wide py-4 px-8 transition-all duration-200 hover:bg-card active:scale-[0.98] uppercase"
            >
              New Group
            </button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useJoinGroup } from "../hooks/useQueries";

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

export default function GroupJoinPage() {
  const navigate = useNavigate();
  const { token } = useParams({ from: "/group-join/$token" });
  const joinGroup = useJoinGroup();
  const [username, setUsername] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const saved = getSavedGroups().find((g) => g.token === token);
    if (saved) {
      setUsername(saved.username);
      setIsReturning(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    try {
      const groupId = await joinGroup.mutateAsync({
        token,
        username: username.trim(),
      });
      // We need groupName — fetch from getGroupInfo after joining, or save with empty name
      const saved = getSavedGroups().find((g) => g.groupId === groupId);
      saveGroup({
        groupId,
        username: username.trim(),
        token,
        groupName: saved?.groupName ?? "",
      });
      navigate({ to: "/group/$groupId", params: { groupId } });
    } catch {
      // error shown via mutation state
    }
  };

  return (
    <div className="phone-frame grain-overlay">
      <main className="flex flex-col min-h-dvh bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-border">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-display text-lg font-semibold text-foreground">
              Join Group
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-5 py-8">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
          >
            {isReturning && (
              <div className="p-3 bg-card border border-border">
                <p className="font-body text-sm text-foreground">
                  👋 Welcome back!
                </p>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  You've been here before. Confirm your name to re-enter.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="username"
                className="font-body text-xs uppercase tracking-wider text-muted-foreground"
              >
                Your Name
              </Label>
              <Input
                id="username"
                data-ocid="group_join.input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ghost"
                className="bg-card border-border font-body text-foreground placeholder:text-muted-foreground/40 rounded-none h-12"
                maxLength={30}
                autoFocus
              />
            </div>

            {joinGroup.isError && (
              <p
                data-ocid="group_join.error_state"
                className="text-sm text-destructive font-body"
              >
                Invalid link or group not found. The link may have changed.
              </p>
            )}

            <button
              type="submit"
              data-ocid="group_join.submit_button"
              disabled={joinGroup.isPending || !username.trim()}
              className="w-full bg-primary text-primary-foreground font-body text-sm font-medium tracking-wide py-4 h-12 uppercase transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {joinGroup.isPending ? (
                <>
                  <Loader2
                    data-ocid="group_join.loading_state"
                    className="w-4 h-4 animate-spin"
                  />
                  Joining...
                </>
              ) : isReturning ? (
                "Enter Group"
              ) : (
                "Join Group"
              )}
            </button>
          </motion.form>
        </div>
      </main>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, ExternalLink, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useCreateGroup } from "../hooks/useQueries";

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

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const createGroup = useCreateGroup();
  const [groupName, setGroupName] = useState("");
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<{
    groupId: string;
    token: string;
    groupName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteLink = result
    ? `${window.location.origin}/group-join/${result.token}`
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !username.trim()) return;
    try {
      const [groupId, token] = await createGroup.mutateAsync({
        groupName: groupName.trim(),
        username: username.trim(),
      });
      const saved = {
        groupId,
        username: username.trim(),
        token,
        groupName: groupName.trim(),
      };
      saveGroup(saved);
      setResult({ groupId, token, groupName: groupName.trim() });
    } catch {
      // error handled by mutation state
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGroup = () => {
    if (!result) return;
    navigate({ to: "/group/$groupId", params: { groupId: result.groupId } });
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
              New Group
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {!result ? (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6"
            >
              <p className="text-sm text-muted-foreground font-body">
                Create a group chat. Share the invite link — anyone with it can
                join anytime.
              </p>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="group-name"
                  className="font-body text-xs uppercase tracking-wider text-muted-foreground"
                >
                  Group Name
                </Label>
                <Input
                  id="group-name"
                  data-ocid="create_group.input"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="My Group"
                  className="bg-card border-border font-body text-foreground placeholder:text-muted-foreground/40 rounded-none h-12"
                  maxLength={50}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="username"
                  className="font-body text-xs uppercase tracking-wider text-muted-foreground"
                >
                  Your Name
                </Label>
                <Input
                  id="username"
                  data-ocid="create_group.username_input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ghost"
                  className="bg-card border-border font-body text-foreground placeholder:text-muted-foreground/40 rounded-none h-12"
                  maxLength={30}
                />
              </div>

              {createGroup.isError && (
                <p className="text-sm text-destructive font-body">
                  Failed to create group. Please try again.
                </p>
              )}

              <Button
                type="submit"
                data-ocid="create_group.submit_button"
                disabled={
                  createGroup.isPending || !groupName.trim() || !username.trim()
                }
                className="w-full bg-primary text-primary-foreground font-body text-sm font-medium tracking-wide py-4 h-12 rounded-none uppercase transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                {createGroup.isPending ? "Creating..." : "Create Group"}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {result.groupName}
                </h2>
                <p className="text-sm text-muted-foreground font-body">
                  Group created successfully
                </p>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-card border border-border">
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Permanent Invite Link
                </p>
                <p className="font-body text-sm text-foreground break-all leading-relaxed">
                  {inviteLink}
                </p>
                <button
                  type="button"
                  data-ocid="create_group.copy_button"
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mt-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-primary">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-2 p-3 bg-muted/30 border border-border">
                <p className="font-body text-xs text-muted-foreground">
                  ⚠️ Save this link — it's the only way back to this group
                </p>
              </div>

              <Button
                type="button"
                data-ocid="create_group.open_group_button"
                onClick={handleOpenGroup}
                className="w-full bg-primary text-primary-foreground font-body text-sm font-medium tracking-wide h-12 rounded-none uppercase transition-all hover:bg-primary/90 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Group
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

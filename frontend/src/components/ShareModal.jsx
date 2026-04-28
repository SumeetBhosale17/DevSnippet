import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Copy, Link, UserPlus, Loader2, Check } from "lucide-react";

export default function ShareModal({ snippetId, existingToken }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  
  // Link sharing state
  const [shareToken, setShareToken] = useState(existingToken || null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // User sharing state
  const [targetUser, setTargetUser] = useState("");
  const [sharingUser, setSharingUser] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareError, setShareError] = useState("");

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    try {
      const res = await api.generateShareLink(token, snippetId);
      if (res.success) {
        setShareToken(res.data.token);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/snippet/${snippetId}?token=${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareUser = async () => {
    if (!targetUser.trim()) return;
    setSharingUser(true);
    setShareMessage("");
    setShareError("");
    try {
      const res = await api.shareWithUser(token, snippetId, targetUser);
      if (res.success) {
        setShareMessage("Shared successfully!");
        setTargetUser("");
      } else {
        setShareError(res.message || "Failed to share.");
      }
    } catch (err) {
      setShareError("An error occurred.");
    } finally {
      setSharingUser(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Share2 className="w-3 h-3" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Share Snippet</DialogTitle>
          <DialogDescription>
            Share this snippet via a public link or directly with specific users.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Link Sharing */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Link className="w-4 h-4" /> Share via Link
            </h4>
            {shareToken ? (
              <div className="flex items-center gap-2">
                <Input 
                  readOnly 
                  value={`${window.location.origin}/snippet/${snippetId}?token=${shareToken}`} 
                  className="bg-muted text-xs font-mono"
                />
                <Button size="sm" onClick={handleCopyLink} className="w-20">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            ) : (
              <Button 
                variant="secondary" 
                onClick={handleGenerateLink} 
                disabled={generatingLink}
                className="w-full"
              >
                {generatingLink ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Generate Shareable Link
              </Button>
            )}
          </div>

          {/* User Sharing */}
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Share with User
            </h4>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Username or Email"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                className="bg-background"
              />
              <Button size="sm" onClick={handleShareUser} disabled={sharingUser || !targetUser.trim()}>
                {sharingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : "Share"}
              </Button>
            </div>
            {shareMessage && <p className="text-xs text-green-500">{shareMessage}</p>}
            {shareError && <p className="text-xs text-destructive">{shareError}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

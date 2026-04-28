import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Copy, Trash2, Pencil, Save, X,
  Loader2, Clock, User as UserIcon, Eye, EyeOff, Code2
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { getLangColor, langBadgeStyle, langLabel } from "@/lib/langColors";
import CodeBlock from "@/components/CodeBlock";
import Comments from "@/components/Comments";
import ShareModal from "@/components/ShareModal";
import { Sparkles } from "lucide-react";

const LANGUAGES = [
  "JavaScript", "Python", "TypeScript", "HTML", "CSS",
  "Go", "Rust", "Java", "C++", "SQL", "YAML", "Other",
];

export default function SnippetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});

  // AI state
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [activeSummary, setActiveSummary] = useState("");

  useEffect(() => {
    fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    setLoading(true);
    setError("");
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const shareToken = urlParams.get("token");
      const fetchId = shareToken ? `${id}?token=${shareToken}` : id;
      const res = await api.getSnippetById(token, fetchId);
      if (res.success) {
        setSnippet(res.data);
        setEditData({
          title: res.data.title,
          description: res.data.description || "",
          code: res.data.code,
          language: res.data.language,
          tags: (res.data.tags || []).join(", "),
          visibility: res.data.visibility,
        });
      } else {
        setError(res.message || "Snippet not found.");
      }
    } catch (err) {
      setError("Failed to load snippet.");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user && snippet && snippet.user_id === user.id;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this snippet?")) return;
    setDeleting(true);
    try {
      const res = await api.deleteSnippet(token, id);
      if (res.success) {
        navigate("/snippets");
      } else {
        setError(res.message || "Failed to delete.");
      }
    } catch {
      setError("Failed to delete snippet.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...editData,
        tags: editData.tags
          ? editData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };
      const res = await api.updateSnippet(token, id, payload);
      if (res.success) {
        setSnippet(res.data);
        setEditing(false);
      } else {
        setError(res.message || "Failed to update.");
      }
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (snippet.ai_summary) {
      setActiveSummary(snippet.ai_summary);
      return;
    }
    setGeneratingSummary(true);
    try {
      const res = await api.generateSummary(token, id);
      if (res.success) {
        setActiveSummary(res.data.summary);
      } else {
        setError(res.message || "Failed to generate summary.");
      }
    } catch {
      setError("Failed to generate summary.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error && !snippet) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          {isOwner && !editing && (
            <>
              <ShareModal snippetId={snippet.id} existingToken={snippet.share_token} />
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setEditing(true)}
              >
                <Pencil className="w-3 h-3" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-400"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Delete
              </Button>
            </>
          )}
          {editing && (
            <>
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-primary hover:bg-primary/90"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  setEditing(false);
                  // Reset edit data
                  setEditData({
                    title: snippet.title,
                    description: snippet.description || "",
                    code: snippet.code,
                    language: snippet.language,
                    tags: (snippet.tags || []).join(", "),
                    visibility: snippet.visibility,
                  });
                }}
              >
                <X className="w-3 h-3" /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Code + Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          {editing ? (
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="bg-muted/50 border-border text-lg font-semibold"
              />
            </div>
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">{snippet.title}</h1>
          )}

          {/* Description */}
          {editing ? (
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="bg-muted/50 border-border resize-none h-20"
              />
            </div>
          ) : (
            snippet.description && (
              <p className="text-sm text-muted-foreground">{snippet.description}</p>
            )
          )}

          {/* AI Summary */}
          {!editing && activeSummary && (
            <div className="bg-primary/5 border border-primary/20 rounded-md p-4 space-y-2">
              <h4 className="text-xs font-semibold text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Summary
              </h4>
              <p className="text-sm text-foreground/90 leading-relaxed">{activeSummary}</p>
            </div>
          )}
          {!editing && !activeSummary && (snippet.ai_summary || user) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateSummary} 
              disabled={generatingSummary}
              className="gap-1.5 text-xs border-primary/20 text-primary hover:bg-primary/10"
            >
              {generatingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI Summary
            </Button>
          )}

          {/* Code Block */}
          <Card
            className="bg-card border-border overflow-hidden"
            style={{ borderLeftWidth: '3px', borderLeftColor: getLangColor(snippet.language).bg }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 text-xs">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold"
                  style={langBadgeStyle(snippet.language)}
                >
                  {langLabel(snippet.language)}
                </div>
                <span className="font-medium text-muted-foreground">{snippet.language}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={copyToClipboard}
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            {editing ? (
              <Textarea
                value={editData.code}
                onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                className="bg-[hsl(var(--code-bg))] text-[hsl(var(--code-foreground))] border-none font-mono text-sm min-h-[300px] resize-y leading-relaxed rounded-none"
              />
            ) : (
              <CodeBlock code={snippet.code} language={snippet.language} showLineNumbers />
            )}
          </Card>

          {/* Comments Section */}
          {!editing && <Comments snippetId={snippet.id} />}
        </div>

        {/* Right: Metadata */}
        <div className="space-y-5">
          {/* Info Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold">Details</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Author:</span>
                  <span className="font-medium">{snippet.author}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{new Date(snippet.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="font-medium">{new Date(snippet.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {snippet.visibility === "public" ? (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-muted-foreground">Visibility:</span>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editData.visibility === "public"}
                        onCheckedChange={(checked) =>
                          setEditData({ ...editData, visibility: checked ? "public" : "private" })
                        }
                      />
                      <span className="text-xs">{editData.visibility}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={snippet.visibility === "public" ? "secondary" : "outline"}
                        className="text-[10px] capitalize"
                      >
                        {snippet.visibility}
                      </Badge>
                      {!isOwner && snippet.visibility !== "public" && (
                        <span className="text-[10px] text-muted-foreground">(Shared with you)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          {editing ? (
            <Card className="bg-card border-border">
              <CardContent className="p-5 space-y-3">
                <Label>Language</Label>
                <Select
                  value={editData.language}
                  onValueChange={(val) => setEditData({ ...editData, language: val })}
                >
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang.toLowerCase()}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ) : null}

          {/* Tags */}
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold">Tags</h3>
              {editing ? (
                <Input
                  value={editData.tags}
                  onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                  placeholder="react, auth, hook"
                  className="bg-muted/50 border-border text-sm"
                />
              ) : snippet.tags && snippet.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {snippet.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No tags</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

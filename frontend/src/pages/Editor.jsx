import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code2, Save, ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const LANGUAGES = [
  "JavaScript", "Python", "TypeScript", "HTML", "CSS",
  "Go", "Rust", "Java", "C++", "SQL", "YAML", "Other",
];

export default function Editor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    language: "",
    description: "",
    code: "",
    tags: "",
    visibility: "public",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("devsnippet_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      const res = await api.createSnippet(token, payload);

      if (res.success) {
        navigate("/snippets");
      } else {
        setError(res.message || "Failed to create snippet");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Snippet</h1>
          <p className="text-sm text-muted-foreground">
            Create and store a new reusable code snippet.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Main content */}
          <div className="md:col-span-2 space-y-5">
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., React Authentication Hook"
                    className="bg-muted/50 border-border"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly explain what this snippet does..."
                    className="bg-muted/50 border-border resize-none h-24"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code" className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-primary" /> Code Content
                  </Label>
                  <Textarea
                    id="code"
                    placeholder="Paste your code here..."
                    className="bg-[hsl(var(--code-bg))] text-[hsl(var(--code-foreground))] border-border font-mono text-sm min-h-[300px] resize-y leading-relaxed"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Meta */}
          <div className="space-y-5">
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData({ ...formData, language: val })
                    }
                    required
                  >
                    <SelectTrigger className="bg-muted/50 border-border">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang.toLowerCase()}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="react, auth, hook"
                    className="bg-muted/50 border-border"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div>
                    <Label className="text-sm font-medium">Public Visibility</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formData.visibility === "public"
                        ? "Visible to everyone."
                        : "Only visible to you."}
                    </p>
                  </div>
                  <Switch
                    checked={formData.visibility === "public"}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        visibility: checked ? "public" : "private",
                      })
                    }
                  />
                </div>

                {error && (
                  <div className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 font-semibold gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Snippet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

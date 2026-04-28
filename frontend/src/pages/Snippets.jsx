import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart, Share2, Copy, Plus,
  Bookmark, Code2, Trash2
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { getLangColor, langBadgeStyle, langLabel } from "@/lib/langColors";
import CodeBlock from "@/components/CodeBlock";

export default function Snippets() {
  const { token } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingTags, setTrendingTags] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchSnippets();
    fetchTrendingTags();
  }, []);

  const fetchTrendingTags = async () => {
    try {
      const res = await api.getTrendingTags();
      if (res.success) {
        setTrendingTags(res.data.tags.map(t => t.tag));
      }
    } catch (err) {
      console.error("Failed to fetch trending tags:", err);
    }
  };

  const fetchSnippets = async () => {
    try {
      const token = localStorage.getItem("devsnippet_token");
      const res = await api.getSnippets(token, 1);
      if (res.success) {
        setSnippets(res.data.snippets);
      }
    } catch (err) {
      console.error("Failed to fetch snippets:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteSnippet = async (id) => {
    if (!window.confirm("Delete this snippet?")) return;
    try {
      const res = await api.deleteSnippet(token, id);
      if (res.success) {
        setSnippets(snippets.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Trending tags now fetched from backend API

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Main Feed ── */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editor Feed</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Luminous code curation for the modern architect.
              </p>
            </div>
            <Link to="/editor">
              <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
                <Plus className="w-3.5 h-3.5" /> New Snippet
              </Button>
            </Link>
          </div>

          {/* Snippet Cards */}
          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <CardContent className="p-6 h-52" />
                </Card>
              ))}
            </div>
          ) : snippets.length === 0 ? (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="p-16 flex flex-col items-center text-center">
                <Code2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold mb-1">No snippets yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start building your code library.
                </p>
                <Link to="/editor">
                  <Button size="sm" className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Create Snippet
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {snippets.map((snippet) => (
                <Card
                  key={snippet.id}
                  className="bg-card border-border overflow-hidden hover:border-primary/20 transition-all"
                  style={{ borderLeftWidth: '3px', borderLeftColor: getLangColor(snippet.language).bg }}
                >
                  {/* Card Header */}
                  <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm"
                        style={langBadgeStyle(snippet.language)}
                      >
                        {langLabel(snippet.language)}
                      </div>
                      <div>
                <h3 className="font-semibold text-sm">
                        <Link to={`/snippet/${snippet.id}`} className="hover:text-primary transition-colors">
                          {snippet.title}
                        </Link>
                      </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Shared in {snippet.language} • {timeAgo(snippet.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-400">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-red-400"
                        onClick={() => deleteSnippet(snippet.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Code Block */}
                  <div className="mx-5 mb-3 rounded-lg overflow-hidden border border-border">
                    <CodeBlock code={snippet.code} language={snippet.language} maxHeight="16rem" />
                  </div>

                  {/* Footer */}
                  <div className="px-5 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        className="text-xs font-medium border"
                        style={{
                          backgroundColor: getLangColor(snippet.language).tint,
                          borderColor: getLangColor(snippet.language).border,
                          color: getLangColor(snippet.language).bg,
                        }}
                      >
                        {snippet.language}
                      </Badge>
                      {snippet.tags &&
                        snippet.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs border-border text-muted-foreground"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-8"
                        onClick={() => copyToClipboard(snippet.code, snippet.id)}
                      >
                        <Copy className="w-3 h-3" />
                        {copiedId === snippet.id ? "Copied!" : "Copy Snippet"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-5">
          {/* Trending Tags */}
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingIcon /> Trending Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {(trendingTags.length > 0
                  ? trendingTags
                  : ["ReactQuery", "TailwindCSS", "Vercel", "Microservices"]
                ).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workspace Insights */}
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4">Workspace Insights</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Snippets Created
                  </span>
                  <span className="font-bold text-lg">{snippets.length}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${Math.min(
                          (snippets.length / 200) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                    Storage:{" "}
                    {Math.min(Math.round((snippets.length / 200) * 100), 100)}%
                    Utilized
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automate CTA */}
          <Card className="bg-card border-border overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardContent className="p-5 relative">
              <h3 className="font-bold text-lg mb-1.5">
                Automate your workflow.
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Deploy multi-region clusters with a single JSON snippet.
                Optimized for Obsidian environments.
              </p>
              <Link to="/explore">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-primary/40 text-primary hover:bg-primary/10 text-xs font-semibold"
                >
                  Explore Automation
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-10 pt-6 pb-4 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>© 2026 DEVSNIPPET ARCHITECTURE</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground transition-colors">TERMS</a>
          <a href="#" className="hover:text-foreground transition-colors">PRIVACY</a>
          <a href="#" className="hover:text-foreground transition-colors">SECURITY</a>
          <a href="#" className="hover:text-foreground transition-colors">CONTACT</a>
        </div>
      </footer>
    </div>
  );
}

function TrendingIcon() {
  return (
    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

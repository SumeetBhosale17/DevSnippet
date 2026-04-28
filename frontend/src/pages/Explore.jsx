import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, Compass, Copy, Filter, Globe, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { getLangColor } from "@/lib/langColors";
import CodeBlock from "@/components/CodeBlock";

const LANGUAGES = [
  "All Languages", "JavaScript", "Python", "TypeScript", "HTML", "CSS",
  "Go", "Rust", "Java", "C++", "SQL", "YAML", "Other",
];

export default function Explore() {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Filters
  const [visibility, setVisibility] = useState("public"); // "public" | "mine"
  const [language, setLanguage] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = async (searchQuery, lang = language, tags = tagFilter) => {
    setLoading(true);
    setHasSearched(true);
    try {
      // If no keyword but has filters, use a wildcard-ish search
      const q = searchQuery.trim() || (lang || tags ? "" : "");
      const res = await api.searchSnippets(q || "*", token, 1, {
        language: lang && lang !== "All Languages" ? lang.toLowerCase() : "",
        tags: tags,
      });
      if (res.success) {
        let results = res.data.snippets;
        // Client-side visibility filter
        if (visibility === "mine" && user) {
          results = results.filter((s) => s.user_id === user.id);
        }
        setSnippets(results);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if query comes from URL (e.g., global search bar), or fetch default trending
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    } else {
      // Default explore state: show all public snippets
      performSearch("");
    }
  }, [initialQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    performSearch(query);
  };

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVisibilityChange = (v) => {
    setVisibility(v);
    // Re-search with new filter if we already have results
    if (hasSearched) {
      setTimeout(() => performSearch(query), 0);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Hero search */}
      <div className="text-center space-y-4 pt-6 pb-2">
        <div className="inline-flex items-center gap-2 text-primary mb-2">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Explore Snippets</h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm">
          Search through public code snippets. Our ranking algorithm prioritizes
          title, tags, language, and content matches.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="e.g. react hooks, python api, rust ownership..."
              className="pl-11 h-12 bg-card border-border focus-visible:ring-primary text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-12 px-6 bg-primary hover:bg-primary/90 font-semibold">
            Search
          </Button>
        </form>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Visibility toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => handleVisibilityChange("public")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                visibility === "public"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-3 h-3" /> Public
            </button>
            <button
              onClick={() => handleVisibilityChange("mine")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-border ${
                visibility === "mine"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="w-3 h-3" /> My Snippets
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-3 h-3" />
            Filters
            {(language || tagFilter) && (
              <span className="ml-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {(language ? 1 : 0) + (tagFilter ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        {hasSearched && !loading && (
          <span className="text-xs text-muted-foreground">
            {snippets.length} result{snippets.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="flex items-end gap-4 p-4 bg-card border border-border rounded-lg">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Language</label>
            <Select
              value={language || "All Languages"}
              onValueChange={(val) => {
                const v = val === "All Languages" ? "" : val;
                setLanguage(v);
              }}
            >
              <SelectTrigger className="h-9 bg-muted/50 border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
            <Input
              placeholder="react, api, hooks"
              className="h-9 bg-muted/50 border-border text-sm"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            className="h-9 px-4 bg-primary hover:bg-primary/90 text-xs font-semibold"
            onClick={() => performSearch(query, language, tagFilter)}
          >
            Apply
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs"
            onClick={() => {
              setLanguage("");
              setTagFilter("");
              if (hasSearched) performSearch(query, "", "");
            }}
          >
            Clear
          </Button>
        </div>
      )}

      {/* ── Results ── */}
      {!hasSearched ? (
        <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
          <Search className="w-10 h-10 opacity-20 mb-3" />
          <p className="text-sm">Enter a query above to start searching</p>
        </div>
      ) : loading ? (
        <div className="h-48 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="mt-3 text-sm text-muted-foreground">Running ranking engine...</p>
        </div>
      ) : snippets.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
          <p className="text-sm">
            No snippets found{query ? ` matching "${query}"` : ""}
            {visibility === "mine" ? " in your collection" : ""}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {snippets.map((snippet) => (
            <Link
              key={snippet.id}
              to={`/snippet/${snippet.id}`}
              className="block group"
            >
              <Card
                className="bg-card border-border hover:border-primary/30 transition-all h-full overflow-hidden"
                style={{ borderLeftWidth: '3px', borderLeftColor: getLangColor(snippet.language).bg }}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-primary transition-colors">
                        {snippet.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        by {snippet.author} •{" "}
                        {new Date(snippet.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-primary/40 text-primary text-[10px] shrink-0 ml-2"
                    >
                      Score: {snippet._score}
                    </Badge>
                  </div>

                  <div className="rounded-md overflow-hidden border border-border">
                    <CodeBlock code={snippet.code} language={snippet.language} maxHeight="7rem" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge
                        className="text-[10px] border"
                        style={{
                          backgroundColor: getLangColor(snippet.language).tint,
                          borderColor: getLangColor(snippet.language).border,
                          color: getLangColor(snippet.language).bg,
                        }}
                      >
                        {snippet.language}
                      </Badge>
                      {snippet.tags &&
                        snippet.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-[10px] border-border text-muted-foreground"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        copyToClipboard(snippet.code, snippet.id);
                      }}
                    >
                      <Copy className="w-3 h-3" />
                      {copiedId === snippet.id ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

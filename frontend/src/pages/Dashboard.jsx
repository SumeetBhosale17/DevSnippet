import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Clock, Languages, Activity,
  ArrowUpRight, Code2, ExternalLink, Plus, Compass, FolderCode
} from "lucide-react";
import { api } from "@/lib/api";
import { getLangColor, langBadgeStyle, langLabel } from "@/lib/langColors";
import CodeBlock from "@/components/CodeBlock";

export default function Dashboard() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, languages: {}, recentCount: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("devsnippet_token");
        const res = await api.getSnippets(token, 1);
        if (res.success) {
          const allSnippets = res.data.snippets;
          setSnippets(allSnippets);

          // Compute stats
          const langMap = {};
          allSnippets.forEach((s) => {
            langMap[s.language] = (langMap[s.language] || 0) + 1;
          });
          const now = new Date();
          const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
          const recentCount = allSnippets.filter(
            (s) => new Date(s.created_at) >= weekAgo
          ).length;
          setStats({
            total: res.data.total || allSnippets.length,
            languages: langMap,
            recentCount,
          });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const topLanguages = Object.entries(stats.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);


  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time telemetry from core monolithic clusters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            LIVE STREAM
          </div>
          <Link to="/editor">
            <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
              <Plus className="w-3.5 h-3.5" /> New Snippet
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Snippets"
          value={loading ? "—" : stats.total.toLocaleString()}
          subtext="+12%"
          subtextColor="text-emerald-400"
          icon={<TrendingUp className="w-4 h-4" />}
          chart={
            <div className="flex items-end gap-1 h-12 mt-2">
              {[40, 55, 35, 60, 50, 70, 65, 80, 75, 90].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/30 rounded-sm min-w-[4px]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          }
        />
        <StatCard
          label="Languages Used"
          value={loading ? "—" : Object.keys(stats.languages).length}
          subtext={topLanguages.length > 0 ? `Top: ${topLanguages[0][0]}` : ""}
          subtextColor="text-primary"
          icon={<Languages className="w-4 h-4" />}
          chart={
            <div className="flex gap-1 mt-3">
              {topLanguages.map(([lang, count]) => (
                <div
                  key={lang}
                  className="h-6 rounded-sm min-w-[20px] flex items-center justify-center text-[8px] font-bold"
                  style={{
                    backgroundColor: getLangColor(lang).tint,
                    color: getLangColor(lang).bg,
                    flex: count,
                  }}
                >
                  {langLabel(lang)}
                </div>
              ))}
            </div>
          }
        />
        <StatCard
          label="Added This Week"
          value={loading ? "—" : stats.recentCount}
          subtext={stats.recentCount > 0 ? "Active" : "Quiet week"}
          subtextColor={stats.recentCount > 0 ? "text-emerald-400" : "text-muted-foreground"}
          icon={<Clock className="w-4 h-4" />}
          chart={
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((stats.recentCount / Math.max(stats.total, 1)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {stats.recentCount} of {stats.total} total
              </p>
            </div>
          }
        />
      </div>

      {/* ── Two Column: Recent Snippets + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Snippets — 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" /> Recent Snippets
            </h2>
            <Link
              to="/snippets"
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              VIEW ALL <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <CardContent className="p-5 h-40" />
                </Card>
              ))}
            </div>
          ) : snippets.length === 0 ? (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="p-12 flex flex-col items-center text-center">
                <Code2 className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">
                  No snippets yet.{" "}
                  <Link to="/editor" className="text-primary hover:underline">
                    Create your first one
                  </Link>
                </p>
              </CardContent>
            </Card>
          ) : (
            snippets.slice(0, 4).map((snippet) => (
              <Link key={snippet.id} to={`/snippet/${snippet.id}`} className="block">
              <Card
                className="bg-card border-border hover:border-primary/30 transition-all group overflow-hidden cursor-pointer"
                style={{ borderLeftWidth: '3px', borderLeftColor: getLangColor(snippet.language).bg }}
              >
                {/* Header */}
                <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold uppercase"
                      style={langBadgeStyle(snippet.language)}
                    >
                      {langLabel(snippet.language)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">
                        {snippet.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Modified {timeAgo(snippet.updated_at)} •{" "}
                        {snippet.visibility === "public" ? "Public" : "Private"}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Code block */}
                <div className="mx-5 mb-4 rounded-md overflow-hidden border border-border">
                  <CodeBlock code={snippet.code} language={snippet.language} maxHeight="8rem" />
                </div>
              </Card>
              </Link>
            ))
          )}
        </div>

        {/* Right Column — 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Languages */}
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Active Languages
              </h3>
              {topLanguages.length > 0 ? (
                <div className="space-y-3">
                  {topLanguages.map(([lang, count]) => (
                    <div key={lang} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center"
                        style={langBadgeStyle(lang)}
                      >
                        <span className="text-[9px] font-bold uppercase">
                          {langLabel(lang)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="capitalize font-medium">{lang}</span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-4 px-1.5 font-medium"
                          >
                            {count}
                          </Badge>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: getLangColor(lang).bg,
                              width: `${Math.min(
                                (count / (stats.total || 1)) * 100 * 3,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 overflow-hidden relative">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" /> Quick Actions
              </h3>
              <div className="space-y-2">
                <Link to="/editor" className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs h-9 border-border hover:border-primary/40 hover:text-primary"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Snippet
                  </Button>
                </Link>
                <Link to="/explore" className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs h-9 border-border hover:border-primary/40 hover:text-primary"
                  >
                    <Compass className="w-3.5 h-3.5" /> Explore Public
                  </Button>
                </Link>
                <Link to="/snippets" className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs h-9 border-border hover:border-primary/40 hover:text-primary"
                  >
                    <FolderCode className="w-3.5 h-3.5" /> My Snippets
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4">Workspace Insights</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Snippets Created
                  </span>
                  <span className="font-bold text-lg">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Added Today
                  </span>
                  <span className="font-bold text-lg">
                    {stats.recentCount}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min((stats.total / 200) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                    Storage: {Math.min(Math.round((stats.total / 200) * 100), 100)}% Utilized
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border pt-6 pb-4 flex items-center justify-between text-[11px] text-muted-foreground">
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

/* ── Stat Card component ── */
function StatCard({ label, value, subtext, subtextColor, icon, chart }) {
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {subtext && (
            <span className={`text-xs font-semibold ${subtextColor}`}>
              {subtext}
            </span>
          )}
        </div>
        {chart}
      </CardContent>
    </Card>
  );
}

/* ── Utility: relative time ── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Code2, Compass, LayoutDashboard, Settings, Search,
  Bell, Moon, Sun, BookOpen, LogOut, BarChart3, Folder
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

export default function MainLayout() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // ⌘K / Ctrl+K shortcut to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchRef.current?.value?.trim();
    if (query) {
      navigate(`/explore?q=${encodeURIComponent(query)}`);
      searchRef.current.value = "";
      searchRef.current.blur();
    }
  };

  const initials = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* ── Left Sidebar ── */}
      <aside className="hidden md:flex w-56 flex-col border-r border-border bg-[hsl(var(--sidebar-bg))] sticky top-0 h-screen shrink-0">
        {/* Brand */}
        <div className="px-5 pt-6 pb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-md shadow-primary/20">
              <Code2 className="text-white w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight uppercase">DevSnippet</span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5 tracking-wider">VITREOUS V1.0.4</p>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1">
          <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to="/snippets" icon={Code2} label="Snippets" />
          <SidebarLink to="/explore" icon={Compass} label="Explore" />
          <SidebarLink to="/projects" icon={Folder} label="Projects" />
          <SidebarLink to="/analytics" icon={BarChart3} label="Analytics" />
          <SidebarLink to="/settings" icon={Settings} label="Settings" />
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-6 space-y-1">
          <SidebarLink to="/docs" icon={BookOpen} label="Docs" />
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search across snippets and nodes..."
              className="pl-10 h-9 bg-muted/50 border-border text-sm focus-visible:ring-1 focus-visible:ring-primary"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground">⌘K</kbd>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-2 ml-6">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {/* User avatar */}
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-border">
              <div className="text-right hidden lg:block">
                <p className="text-xs font-medium leading-none">
                  {user?.username || "Guest"}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  {isAuthenticated ? "Developer" : "Not signed in"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-primary-foreground text-xs font-bold ring-2 ring-primary/20">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon: Icon, label }) {
  const location = useLocation();
  const isActive = to === "/"
    ? location.pathname === "/"
    : location.pathname.startsWith(to) && to !== "#";

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
        isActive
          ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}

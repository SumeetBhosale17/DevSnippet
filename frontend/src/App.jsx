import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Snippets from "@/pages/Snippets";
import SnippetView from "@/pages/SnippetView";
import Auth from "@/pages/Auth";
import Editor from "@/pages/Editor";
import Explore from "@/pages/Explore";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/snippets" element={<Snippets />} />
          <Route path="/snippet/:id" element={<SnippetView />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/projects" element={<ComingSoon title="Projects" />} />
          <Route path="/analytics" element={<ComingSoon title="Analytics" />} />
          <Route path="/settings" element={<ComingSoon title="Settings" />} />
          <Route path="/docs" element={<ComingSoon title="Documentation" />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm">This feature is coming soon.</p>
      </div>
    </div>
  );
}

export default App;

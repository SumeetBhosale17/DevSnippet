import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/components/ThemeProvider";

/**
 * Map our stored language names to Prism-compatible identifiers.
 */
const LANG_MAP = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  html: "html",
  css: "css",
  go: "go",
  rust: "rust",
  java: "java",
  "c++": "cpp",
  cpp: "cpp",
  sql: "sql",
  yaml: "yaml",
  ruby: "ruby",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  shell: "bash",
  bash: "bash",
  json: "json",
  xml: "xml",
  markdown: "markdown",
  other: "text",
};

function getPrismLanguage(language) {
  if (!language) return "text";
  const key = language.toLowerCase().trim();
  return LANG_MAP[key] || "text";
}

/**
 * Reusable syntax-highlighted code block.
 *
 * @param {string}  code            - The source code to display
 * @param {string}  language        - Language name (e.g., "javascript", "python")
 * @param {string}  [maxHeight]     - Optional CSS max-height (e.g., "8rem", "16rem")
 * @param {boolean} [showLineNumbers] - Whether to show line numbers (default: false)
 * @param {string}  [className]     - Additional CSS classes for the wrapper
 */
export default function CodeBlock({
  code,
  language,
  maxHeight,
  showLineNumbers = false,
  className = "",
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const prismLang = getPrismLanguage(language);

  const customStyle = {
    margin: 0,
    padding: "1rem 1.25rem",
    fontSize: "0.8125rem",
    lineHeight: "1.6",
    borderRadius: 0,
    background: "transparent",
    ...(maxHeight ? { maxHeight, overflow: "auto" } : {}),
  };

  // Container background matches our design system
  const wrapperStyle = {
    backgroundColor: isDark
      ? "hsl(220 20% 8%)"     // deep dark for dark mode
      : "hsl(220 14% 96%)",   // soft gray for light mode
    borderRadius: "0.375rem",
    overflow: "hidden",
  };

  return (
    <div className={className} style={wrapperStyle}>
      <SyntaxHighlighter
        language={prismLang}
        style={isDark ? oneDark : oneLight}
        showLineNumbers={showLineNumbers}
        wrapLines
        customStyle={customStyle}
        codeTagProps={{
          style: {
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
          },
        }}
        lineNumberStyle={{
          minWidth: "2.5em",
          paddingRight: "1em",
          color: isDark ? "hsl(220 10% 35%)" : "hsl(220 10% 70%)",
          userSelect: "none",
        }}
      >
        {String(code || "").replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}

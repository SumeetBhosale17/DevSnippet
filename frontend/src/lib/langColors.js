/**
 * Language color mappings inspired by GitHub's linguist colors.
 * Each language has a primary color (bg), a text-safe foreground, and a subtle tint.
 */

const LANG_COLORS = {
  javascript:  { bg: "#F7DF1E", fg: "#1a1a1a", tint: "rgba(247,223,30,0.15)",  border: "rgba(247,223,30,0.3)",  label: "JS" },
  typescript:  { bg: "#3178C6", fg: "#ffffff", tint: "rgba(49,120,198,0.15)",   border: "rgba(49,120,198,0.3)",  label: "TS" },
  python:      { bg: "#3572A5", fg: "#ffffff", tint: "rgba(53,114,165,0.15)",   border: "rgba(53,114,165,0.3)",  label: "PY" },
  html:        { bg: "#E34C26", fg: "#ffffff", tint: "rgba(227,76,38,0.15)",    border: "rgba(227,76,38,0.3)",   label: "HTML" },
  css:         { bg: "#663399", fg: "#ffffff", tint: "rgba(102,51,153,0.15)",   border: "rgba(102,51,153,0.3)",  label: "CSS" },
  go:          { bg: "#00ADD8", fg: "#ffffff", tint: "rgba(0,173,216,0.15)",    border: "rgba(0,173,216,0.3)",   label: "GO" },
  rust:        { bg: "#DEA584", fg: "#1a1a1a", tint: "rgba(222,165,132,0.15)",  border: "rgba(222,165,132,0.3)", label: "RS" },
  java:        { bg: "#B07219", fg: "#ffffff", tint: "rgba(176,114,25,0.15)",   border: "rgba(176,114,25,0.3)",  label: "JV" },
  "c++":       { bg: "#F34B7D", fg: "#ffffff", tint: "rgba(243,75,125,0.15)",   border: "rgba(243,75,125,0.3)",  label: "C++" },
  sql:         { bg: "#E38C00", fg: "#ffffff", tint: "rgba(227,140,0,0.15)",    border: "rgba(227,140,0,0.3)",   label: "SQL" },
  yaml:        { bg: "#CB171E", fg: "#ffffff", tint: "rgba(203,23,30,0.15)",    border: "rgba(203,23,30,0.3)",   label: "YML" },
  ruby:        { bg: "#CC342D", fg: "#ffffff", tint: "rgba(204,52,45,0.15)",    border: "rgba(204,52,45,0.3)",   label: "RB" },
  php:         { bg: "#4F5D95", fg: "#ffffff", tint: "rgba(79,93,149,0.15)",    border: "rgba(79,93,149,0.3)",   label: "PHP" },
  swift:       { bg: "#F05138", fg: "#ffffff", tint: "rgba(240,81,56,0.15)",    border: "rgba(240,81,56,0.3)",   label: "SW" },
  kotlin:      { bg: "#A97BFF", fg: "#ffffff", tint: "rgba(169,123,255,0.15)",  border: "rgba(169,123,255,0.3)", label: "KT" },
  shell:       { bg: "#89E051", fg: "#1a1a1a", tint: "rgba(137,224,81,0.15)",   border: "rgba(137,224,81,0.3)",  label: "SH" },
  other:       { bg: "#6B7280", fg: "#ffffff", tint: "rgba(107,114,128,0.15)",  border: "rgba(107,114,128,0.3)", label: "??" },
};

/**
 * Get the color config for a given language.
 * Falls back to "other" if unknown.
 */
export function getLangColor(language) {
  if (!language) return LANG_COLORS.other;
  const key = language.toLowerCase().trim();
  return LANG_COLORS[key] || LANG_COLORS.other;
}

/**
 * Returns a small inline style object for the language badge icon.
 */
export function langBadgeStyle(language) {
  const c = getLangColor(language);
  return {
    backgroundColor: c.bg,
    color: c.fg,
  };
}

/**
 * Returns a tinted card-border style for language-coded cards.
 */
export function langCardStyle(language) {
  const c = getLangColor(language);
  return {
    borderLeftColor: c.bg,
    borderLeftWidth: "3px",
  };
}

/**
 * Returns the short label (e.g., "JS", "PY") for a language.
 */
export function langLabel(language) {
  return getLangColor(language).label;
}

export default LANG_COLORS;

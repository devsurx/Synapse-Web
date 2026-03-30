@import "tailwindcss";

:root {
  --synapse-sage: #96AD8D;
  --bg-base: #0C0E0D;       /* Softer, deep charcoal */
  --bg-surface: #141715;    /* Elevated card background */
  --bg-surface-hover: #1A1E1C; 
  --text-main: #F3F4F6;     /* Off-white, easier on eyes */
  --text-muted: #848A86;    /* Soft gray-green for subtext */
}

body {
  margin: 0;
  background-color: var(--bg-base);
  color: var(--text-main);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Elegant scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: var(--synapse-sage);
}
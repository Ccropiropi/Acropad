const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(code, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(code) + '</code></pre>';
  }
});

// Rule to handle internal links [[note-name]]
md.inline.ruler.push('internal_links', function(state, silent) {
  const pos = state.pos;
  const max = state.posMax;

  // Check for [[
  if (pos + 2 >= max) return false;
  if (state.src.charCodeAt(pos) !== 0x5B) return false; // [
  if (state.src.charCodeAt(pos + 1) !== 0x5B) return false; // [

  let labelStart = pos + 2;
  let labelEnd = state.src.indexOf(']]', labelStart);

  if (labelEnd === -1) return false;

  const label = state.src.substring(labelStart, labelEnd);
  const [noteName, displayText] = label.split('|').map(s => s.trim());

  if (!noteName) return false;

  if (!silent) {
    let token = state.push('link_open', 'a', 1);
    token.attrSet('href', '#note/' + encodeURIComponent(noteName));
    token.attrSet('class', 'internal-link');

    token = state.push('text', '', 0);
    token.content = displayText || noteName;

    state.push('link_close', 'a', -1);
  }

  state.pos = labelEnd + 2;
  return true;
});

const HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
  <style>
    :root {
      --bg-color: #171717;
      --text-color: #E5E5E5;
      --code-bg: #262626;
      --border-color: #404040;
      --accent-color: #3B82F6;
    }
    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      padding: 30px;
      color: var(--text-color);
      background-color: var(--bg-color);
      max-width: 900px;
      margin: 0 auto;
    }
    h1, h2, h3, h4, h5, h6 {
      font-weight: 600;
      color: #fff;
      margin-top: 1.5em;
    }
    pre {
      background-color: var(--code-bg);
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid var(--border-color);
    }
    code {
      font-family: 'JetBrains Mono', monospace;
      background-color: var(--code-bg);
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    .hljs {
      background: var(--code-bg) !important;
      padding: 15px !important;
      border-radius: 8px !important;
      border: 1px solid var(--border-color) !important;
    }
    blockquote {
      border-left: 4px solid var(--accent-color);
      margin: 1.5em 0;
      padding-left: 15px;
      color: #A3A3A3;
      background: rgba(59, 130, 246, 0.1);
      padding: 10px 15px;
      border-radius: 0 4px 4px 0;
    }
    img {
      max-width: 100%;
      border-radius: 8px;
      margin: 10px 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5rem 0;
    }
    th, td {
      border: 1px solid var(--border-color);
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: var(--code-bg);
      font-weight: 600;
    }
    a {
      color: var(--accent-color);
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    a.internal-link {
      color: #60a5fa;
      font-weight: 500;
      border-bottom: 1px dotted #60a5fa;
    }
    a.internal-link:hover {
      background-color: rgba(96, 165, 250, 0.1);
      border-bottom: 1px solid #60a5fa;
    }
  </style>
  <script>
    MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
      },
      svg: { fontCache: 'global' }
    };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
  <div id="content">%CONTENT%</div>
</body>
</html>`;

function renderMarkdown(text) {
  const htmlContent = md.render(text);
  return HTML_TEMPLATE.replace('%CONTENT%', htmlContent);
}

module.exports = {
  renderMarkdown,
  md
};

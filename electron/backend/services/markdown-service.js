const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
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

import markdown
import os

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
            color: #E5E5E5; /* Light text for dark mode */
            background-color: #171717; /* Neutral-900 like */
        }
        pre {
            background-color: #262626;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            font-family: 'Fira Code', 'Consolas', monospace;
            background-color: #262626;
            padding: 2px 4px;
            border-radius: 3px;
        }
        blockquote {
            border-left: 4px solid #3B82F6;
            margin: 0;
            padding-left: 15px;
            color: #A3A3A3;
        }
        img {
            max-width: 100%;
            border-radius: 8px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1rem;
        }
        th, td {
            border: 1px solid #404040;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #262626;
        }
        /* MathJax overrides */
        .MathJax_Display {
            overflow-x: auto;
            overflow-y: hidden;
        }
    </style>
    <!-- MathJax for LaTeX support -->
    <script>
    MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\(', '\)']],
        displayMath: [['$$', '$$'], ['\[', '\]']]
      }
    };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
    {content}
</body>
</html>
"""

def render_markdown(text):
    # Convert markdown to HTML with extensions
    # 'fenced_code' for ``` code blocks
    # 'tables' for tables
    html_content = markdown.markdown(text, extensions=['fenced_code', 'tables'])
    
    # Wrap in full HTML document with styling and MathJax
    return HTML_TEMPLATE.format(content=html_content)

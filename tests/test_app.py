import unittest
import sys
import os

# Ensure we can import from root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ui import render_markdown

class TestRenderer(unittest.TestCase):
    def test_basic_markdown(self):
        md = "**Bold**"
        html = render_markdown(md)
        self.assertIn("<strong>Bold</strong>", html)

    def test_headers(self):
        md = "# Header 1"
        html = render_markdown(md)
        self.assertIn("<h1>Header 1</h1>", html)

    def test_code_block(self):
        md = "```python\nprint('hi')\n```"
        html = render_markdown(md)
        self.assertIn("code", html)
        self.assertIn("print('hi')", html)

    def test_math_rendering_placeholder(self):
        # We don't render math on server side (it's JS), but we check if text is preserved
        md = "$E=mc^2$"
        html = render_markdown(md)
        self.assertIn("$E=mc^2$", html)

if __name__ == '__main__':
    unittest.main()


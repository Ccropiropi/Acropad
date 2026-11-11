import unittest
import sys
import os
import tempfile

# Ensure import resolution from repo root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from PyQt6.QtWidgets import QApplication
from PyQt6.QtGui import QTextDocument
from ui import render_markdown, MarkdownHighlighter, QuickSwitcherDialog, fuzzy_match, ViewMode, AcropadWindow

# Offscreen application fixture for GUI testing
app = QApplication.instance()
if not app:
    os.environ["QT_QPA_PLATFORM"] = "offscreen"
    app = QApplication(sys.argv)

class TestRenderer(unittest.TestCase):
    def test_basic_markdown_renders_html(self):
        html = render_markdown("**Bold Text** and *Italic*")
        self.assertIn("<strong>Bold Text</strong>", html)
        self.assertIn("<em>Italic</em>", html)
        self.assertIn("background-color: #1e1e2e;", html)  # Catppuccin CSS present

    def test_headers_and_code_blocks(self):
        md = "# Header 1\n\n```python\nprint('hello')\n```"
        html = render_markdown(md)
        self.assertIn("<h1>Header 1</h1>", html)
        self.assertIn("<code>", html)
        self.assertIn("print('hello')", html)

    def test_math_rendering_placeholder(self):
        md = "$E=mc^2$"
        html = render_markdown(md)
        self.assertIn("$E=mc^2$", html)

    def test_zero_chromium_import(self):
        """Assert PyQt6.QtWebEngineWidgets is never imported anywhere in ui."""
        import ui
        self.assertNotIn("QtWebEngineWidgets", dir(ui))
        self.assertNotIn("QWebEngineView", dir(ui))

TestNativeRenderer = TestRenderer


class TestMarkdownHighlighter(unittest.TestCase):
    def setUp(self):
        self.doc = QTextDocument()
        self.highlighter = MarkdownHighlighter(self.doc)

    def test_highlighter_initialization(self):
        self.assertIsNotNone(self.highlighter.fmt_h1)
        self.assertIsNotNone(self.highlighter.fmt_bold)
        self.assertIsNotNone(self.highlighter.fmt_code_block)

    def test_multiline_code_block_state(self):
        text = "Normal line\n```python\nvar = 1\n```\nAnother normal line"
        self.doc.setPlainText(text)
        b0 = self.doc.findBlockByLineNumber(0)
        b1 = self.doc.findBlockByLineNumber(1)
        b2 = self.doc.findBlockByLineNumber(2)
        b3 = self.doc.findBlockByLineNumber(3)
        b4 = self.doc.findBlockByLineNumber(4)

        # Lines inside code block must be flagged with STATE_IN_CODE_BLOCK
        self.assertEqual(b0.userState(), MarkdownHighlighter.STATE_NORMAL)
        self.assertEqual(b1.userState(), MarkdownHighlighter.STATE_IN_CODE_BLOCK)
        self.assertEqual(b2.userState(), MarkdownHighlighter.STATE_IN_CODE_BLOCK)
        self.assertEqual(b3.userState(), MarkdownHighlighter.STATE_NORMAL)
        self.assertEqual(b4.userState(), MarkdownHighlighter.STATE_NORMAL)


class TestQuickSwitcherFuzzyMatch(unittest.TestCase):
    def test_fuzzy_match_exact(self):
        self.assertTrue(fuzzy_match("notes", "notes.md"))

    def test_fuzzy_match_subsequence(self):
        self.assertTrue(fuzzy_match("regdes", "docs/regions-design.md"))
        self.assertTrue(fuzzy_match("p6", "pyqt6_notes.txt"))

    def test_fuzzy_match_case_insensitivity(self):
        self.assertTrue(fuzzy_match("ACRO", "acropad_spec.md"))

    def test_fuzzy_match_mismatch(self):
        self.assertFalse(fuzzy_match("xyz123", "acropad_spec.md"))

    def test_empty_pattern(self):
        self.assertTrue(fuzzy_match("", "any_file.md"))


class TestViewModeStateMachine(unittest.TestCase):
    def test_view_mode_cycle(self):
        mode = ViewMode.DUAL
        mode = ViewMode((mode + 1) % 3)
        self.assertEqual(mode, ViewMode.EDIT)
        mode = ViewMode((mode + 1) % 3)
        self.assertEqual(mode, ViewMode.PREVIEW)
        mode = ViewMode((mode + 1) % 3)
        self.assertEqual(mode, ViewMode.DUAL)


class TestAcropadWindowOffscreen(unittest.TestCase):
    def test_window_init_and_state(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            win = AcropadWindow(tmpdir)
            self.assertIsNotNone(win)
            self.assertEqual(win.view_mode, ViewMode.DUAL)
            self.assertFalse(win.is_zen_mode)
            win.toggle_view_mode()
            self.assertEqual(win.view_mode, ViewMode.EDIT)
            win.toggle_zen_mode()
            self.assertTrue(win.is_zen_mode)
            win.toggle_zen_mode()
            self.assertFalse(win.is_zen_mode)
            win.close()


if __name__ == '__main__':
    unittest.main()

import os
import sys
import logging
from enum import IntEnum
import markdown
import traceback

from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QSplitter, 
    QPlainTextEdit, QTextBrowser, QTreeView, QFileDialog, 
    QMessageBox, QLabel, QLineEdit, QPushButton, QStatusBar,
    QDialog, QListWidget, QListWidgetItem
)
from PyQt6.QtCore import Qt, QDir, QTimer, QUrl, QThreadPool, pyqtSignal, QRegularExpression
from PyQt6.QtGui import (
    QAction, QIcon, QFont, QColor, QPalette, QFileSystemModel,
    QSyntaxHighlighter, QTextCharFormat, QKeySequence, QShortcut
)

from worker import Worker

# --- View Mode Enum ---

class ViewMode(IntEnum):
    DUAL = 0
    EDIT = 1
    PREVIEW = 2

# --- Subsequence Fuzzy Matching ---

def fuzzy_match(pattern: str, text: str) -> bool:
    """Returns True if every character in pattern appears sequentially in text (case-insensitive)."""
    if not pattern:
        return True
    pattern = pattern.lower()
    text = text.lower()
    p_idx = 0
    for char in text:
        if char == pattern[p_idx]:
            p_idx += 1
            if p_idx == len(pattern):
                return True
    return False

# --- Native HTML & CSS Template (No External CDNs, Catppuccin Mocha) ---

CATPPUCCIN_CSS = """
body {
    background-color: #1e1e2e;
    color: #cdd6f4;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    padding: 24px;
    margin: 0;
}
h1 { color: #89b4fa; font-size: 24px; border-bottom: 1px solid #313244; padding-bottom: 6px; margin-top: 20px; }
h2 { color: #b4befe; font-size: 20px; border-bottom: 1px solid #313244; padding-bottom: 4px; margin-top: 18px; }
h3 { color: #74c7ec; font-size: 16px; margin-top: 16px; }
h4, h5, h6 { color: #f9e2af; font-size: 14px; }
p { margin: 8px 0; }
strong { color: #fab387; font-weight: bold; }
em { color: #f9e2af; font-style: italic; }
del { color: #6c7086; text-decoration: line-through; }
pre {
    background-color: #181825;
    border: 1px solid #313244;
    border-radius: 6px;
    padding: 12px;
    font-family: "JetBrains Mono", "Cascadia Code", Consolas, monospace;
    font-size: 12px;
    color: #a6e3a1;
}
code {
    background-color: #313244;
    color: #a6e3a1;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
}
blockquote {
    border-left: 4px solid #89b4fa;
    background-color: #181825;
    margin: 12px 0;
    padding: 8px 16px;
    color: #a6adc8;
    font-style: italic;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;
}
th, td {
    border: 1px solid #313244;
    padding: 8px 12px;
    text-align: left;
}
th {
    background-color: #181825;
    color: #89b4fa;
    font-weight: bold;
}
ul, ol {
    margin: 8px 0;
    padding-left: 24px;
    color: #cdd6f4;
}
li { margin: 4px 0; }
a {
    color: #89b4fa;
    text-decoration: underline;
}
hr {
    border: 0;
    border-top: 1px solid #313244;
    margin: 20px 0;
}
"""

def render_markdown(text: str) -> str:
    """Renders markdown into styled HTML compatible with QTextBrowser."""
    import re
    html_body = markdown.markdown(
        text,
        extensions=['fenced_code', 'tables', 'nl2br']
    )
    html_body = re.sub(r'<code class="[^"]*">', '<code>', html_body)
    return f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{CATPPUCCIN_CSS}</style></head><body>{html_body}</body></html>"

# --- In-Editor Syntax Highlighter (Catppuccin Mocha) ---

class MarkdownHighlighter(QSyntaxHighlighter):
    STATE_NORMAL = 0
    STATE_IN_CODE_BLOCK = 1

    def __init__(self, parent=None):
        self._busy = False
        super().__init__(parent)
        self._rules = []
        self._init_formats()
        self._init_rules()
        doc = self.document()
        if doc is not None:
            doc.contentsChanged.connect(self._on_doc_changed)

    def _on_doc_changed(self):
        if not self._busy:
            self._busy = True
            try:
                self.rehighlight()
            finally:
                self._busy = False

    def _init_formats(self):
        mono_font = QFont("JetBrains Mono")
        mono_font.setStyleHint(QFont.StyleHint.Monospace)

        # H1
        self.fmt_h1 = QTextCharFormat()
        self.fmt_h1.setForeground(QColor("#f38ba8"))
        self.fmt_h1.setFontWeight(QFont.Weight.Bold)
        self.fmt_h1.setFontPointSize(15)

        # H2
        self.fmt_h2 = QTextCharFormat()
        self.fmt_h2.setForeground(QColor("#fab387"))
        self.fmt_h2.setFontWeight(QFont.Weight.Bold)
        self.fmt_h2.setFontPointSize(13)

        # H3
        self.fmt_h3 = QTextCharFormat()
        self.fmt_h3.setForeground(QColor("#f9e2af"))
        self.fmt_h3.setFontWeight(QFont.Weight.Bold)
        self.fmt_h3.setFontPointSize(12)

        # Bold
        self.fmt_bold = QTextCharFormat()
        self.fmt_bold.setForeground(QColor("#fab387"))
        self.fmt_bold.setFontWeight(QFont.Weight.Bold)

        # Italic
        self.fmt_italic = QTextCharFormat()
        self.fmt_italic.setForeground(QColor("#f9e2af"))
        self.fmt_italic.setFontItalic(True)

        # Strikethrough
        self.fmt_strike = QTextCharFormat()
        self.fmt_strike.setForeground(QColor("#6c7086"))
        self.fmt_strike.setFontStrikeOut(True)

        # Inline Code
        self.fmt_inline_code = QTextCharFormat()
        self.fmt_inline_code.setFont(mono_font)
        self.fmt_inline_code.setForeground(QColor("#a6e3a1"))
        self.fmt_inline_code.setBackground(QColor("#313244"))

        # Code Block Line
        self.fmt_code_block = QTextCharFormat()
        self.fmt_code_block.setFont(mono_font)
        self.fmt_code_block.setForeground(QColor("#a6e3a1"))
        self.fmt_code_block.setBackground(QColor("#181825"))

        # Blockquote
        self.fmt_quote = QTextCharFormat()
        self.fmt_quote.setForeground(QColor("#a6adc8"))
        self.fmt_quote.setFontItalic(True)

        # Lists (Ordered & Unordered)
        self.fmt_list = QTextCharFormat()
        self.fmt_list.setForeground(QColor("#89b4fa"))
        self.fmt_list.setFontWeight(QFont.Weight.Bold)

        # Wikilinks [[target|alias]] or [[target]]
        self.fmt_wikilink = QTextCharFormat()
        self.fmt_wikilink.setForeground(QColor("#cba6f7"))
        self.fmt_wikilink.setFontUnderline(True)

    def _init_rules(self):
        self._rules = [
            # Headers
            (QRegularExpression(r"^#\s+[^\n]*"), self.fmt_h1),
            (QRegularExpression(r"^##\s+[^\n]*"), self.fmt_h2),
            (QRegularExpression(r"^###\s+[^\n]*"), self.fmt_h3),
            # Wikilinks: [[target]] or [[target|display]]
            (QRegularExpression(r"\[\[[^\]\n]+\]\]"), self.fmt_wikilink),
            # Inline Code: `code`
            (QRegularExpression(r"`[^`\n]+`"), self.fmt_inline_code),
            # Bold: **bold** or __bold__
            (QRegularExpression(r"(\*\*|__)[^\*\n]+(\*\*|__)"), self.fmt_bold),
            # Italic: *italic* or _italic_
            (QRegularExpression(r"(?<!\*)\*[^\*\n]+(?!\*)\*"), self.fmt_italic),
            # Strikethrough: ~~strike~~
            (QRegularExpression(r"~~[^~\n]+~~"), self.fmt_strike),
            # Blockquotes: > quote
            (QRegularExpression(r"^\s*>[^\n]*"), self.fmt_quote),
            # Lists: - item, * item, 1. item
            (QRegularExpression(r"^\s*([*+-]|\d+\.)\s+"), self.fmt_list),
        ]

        self._fence_start = QRegularExpression(r"^```")
        self._fence_end = QRegularExpression(r"^```")

    def highlightBlock(self, text: str | None):  # type: ignore[override]
        if not text:
            self.setCurrentBlockState(self.STATE_NORMAL)
            return

        # 1. Apply single-line syntax rules
        for pattern, fmt in self._rules:
            match_iterator = pattern.globalMatch(text)
            while match_iterator.hasNext():
                match = match_iterator.next()
                self.setFormat(match.capturedStart(), match.capturedLength(), fmt)

        # 2. Multi-line Code Block State Machine
        self.setCurrentBlockState(self.STATE_NORMAL)

        if self.previousBlockState() == self.STATE_IN_CODE_BLOCK:
            # We entered this line inside a code block
            match = self._fence_end.match(text)
            if match.hasMatch():
                # Block ends on this line
                self.setFormat(0, match.capturedLength(), self.fmt_code_block)
                self.setCurrentBlockState(self.STATE_NORMAL)
            else:
                # Whole line is in code block
                self.setFormat(0, len(text), self.fmt_code_block)
                self.setCurrentBlockState(self.STATE_IN_CODE_BLOCK)
        else:
            # We entered in normal state; check if code block starts here
            match = self._fence_start.match(text)
            if match.hasMatch():
                # Check if it also closes on the same line
                rest = text[match.capturedLength():]
                if "```" in rest:
                    self.setFormat(0, len(text), self.fmt_code_block)
                    self.setCurrentBlockState(self.STATE_NORMAL)
                else:
                    self.setFormat(0, len(text), self.fmt_code_block)
                    self.setCurrentBlockState(self.STATE_IN_CODE_BLOCK)

# --- Quick Switcher Modal Dialog ---

class QuickSwitcherDialog(QDialog):
    file_selected = pyqtSignal(str)  # Emits absolute file path

    def __init__(self, base_dir: str, parent=None):
        super().__init__(parent)
        self.base_dir = os.path.abspath(base_dir)
        self.all_files = []
        self._init_ui()
        self._index_files()

    def _init_ui(self):
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.Dialog)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, False)
        self.setFixedSize(560, 360)
        self.setStyleSheet("""
            QDialog {
                background-color: #1e1e2e;
                border: 1px solid #313244;
                border-radius: 8px;
            }
            QLineEdit {
                background-color: #181825;
                color: #cdd6f4;
                border: 1px solid #45475a;
                border-radius: 6px;
                padding: 10px 14px;
                font-size: 14px;
            }
            QLineEdit:focus {
                border: 1px solid #89b4fa;
            }
            QListWidget {
                background-color: #181825;
                color: #cdd6f4;
                border: 1px solid #313244;
                border-radius: 6px;
                padding: 6px;
                outline: none;
            }
            QListWidget::item {
                padding: 8px 12px;
                border-radius: 4px;
            }
            QListWidget::item:selected {
                background-color: #89b4fa;
                color: #11111b;
                font-weight: bold;
            }
        """)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(14, 14, 14, 14)
        layout.setSpacing(10)

        self.input_field = QLineEdit()
        self.input_field.setPlaceholderText("Search notes (fuzzy matching)...")
        self.input_field.textChanged.connect(self._filter_list)
        self.input_field.returnPressed.connect(self._on_enter_pressed)
        self.input_field.installEventFilter(self)
        layout.addWidget(self.input_field)

        self.list_widget = QListWidget()
        self.list_widget.itemDoubleClicked.connect(self._on_item_activated)
        layout.addWidget(self.list_widget)

    def eventFilter(self, a0, a1):  # type: ignore[override]
        from PyQt6.QtCore import QEvent
        from PyQt6.QtGui import QKeyEvent
        if a0 is self.input_field and a1 is not None and a1.type() == QEvent.Type.KeyPress:
            if isinstance(a1, QKeyEvent):
                key = a1.key()
                if key == Qt.Key.Key_Down:
                    curr = self.list_widget.currentRow()
                    if curr < self.list_widget.count() - 1:
                        self.list_widget.setCurrentRow(curr + 1)
                    return True
                elif key == Qt.Key.Key_Up:
                    curr = self.list_widget.currentRow()
                    if curr > 0:
                        self.list_widget.setCurrentRow(curr - 1)
                    return True
                elif key == Qt.Key.Key_Escape:
                    self.reject()
                    return True
        return super().eventFilter(a0, a1)

    def _index_files(self):
        """Discovers markdown and text files, storing (relative_path, absolute_path)."""
        self.all_files.clear()
        if not os.path.exists(self.base_dir):
            return
        for root, dirs, files in os.walk(self.base_dir):
            # Prune hidden directories (.git, .obsidian, etc.)
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            for file in files:
                if file.startswith('.'):
                    continue
                if file.endswith(('.md', '.txt')):
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, self.base_dir)
                    self.all_files.append((rel_path, full_path))
        self.all_files.sort(key=lambda x: x[0].lower())
        self._filter_list("")

    def _filter_list(self, query: str):
        self.list_widget.clear()
        query = query.strip()
        for rel_path, full_path in self.all_files:
            if fuzzy_match(query, rel_path):
                item = QListWidgetItem(rel_path)
                item.setData(Qt.ItemDataRole.UserRole, full_path)
                self.list_widget.addItem(item)
        if self.list_widget.count() > 0:
            self.list_widget.setCurrentRow(0)

    def _on_enter_pressed(self):
        item = self.list_widget.currentItem()
        if item:
            self._on_item_activated(item)

    def keyPressEvent(self, a0):  # type: ignore[override]
        if a0 is None:
            return
        key = a0.key()
        if key == Qt.Key.Key_Down:
            curr = self.list_widget.currentRow()
            if curr < self.list_widget.count() - 1:
                self.list_widget.setCurrentRow(curr + 1)
        elif key == Qt.Key.Key_Up:
            curr = self.list_widget.currentRow()
            if curr > 0:
                self.list_widget.setCurrentRow(curr - 1)
        elif key in (Qt.Key.Key_Return, Qt.Key.Key_Enter):
            item = self.list_widget.currentItem()
            if item:
                self._on_item_activated(item)
        elif key == Qt.Key.Key_Escape:
            self.reject()
        else:
            super().keyPressEvent(a0)

    def _on_item_activated(self, item: QListWidgetItem):
        full_path = item.data(Qt.ItemDataRole.UserRole)
        self.file_selected.emit(full_path)
        self.accept()

# --- Editor Component ---

class Editor(QPlainTextEdit):
    def __init__(self):
        super().__init__()
        font = QFont("JetBrains Mono")
        font.setStyleHint(QFont.StyleHint.Monospace)
        font.setPointSize(11)
        self.setFont(font)
        self.setStyleSheet("QPlainTextEdit { background-color: #1e1e2e; color: #cdd6f4; border: none; padding: 10px; }")
        doc = self.document()
        if doc is not None:
            self.highlighter = MarkdownHighlighter(doc)

# --- Main Window Component ---

class AcropadWindow(QMainWindow):
    def __init__(self, base_dir):
        super().__init__()
        self.base_dir = os.path.abspath(base_dir)
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)

        self.setWindowTitle("Acropad")
        self.resize(1200, 800)
        
        self.view_mode = ViewMode.DUAL
        self.is_zen_mode = False
        self.current_file = None

        self.threadpool = QThreadPool()
        logging.info(f"Multithreading with maximum {self.threadpool.maxThreadCount()} threads")

        self.setup_theme()

        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(10, 10, 10, 10) 
        main_layout.setSpacing(10)

        self.main_splitter = QSplitter(Qt.Orientation.Horizontal)
        self.main_splitter.setHandleWidth(2)
        self.main_splitter.setStyleSheet("QSplitter::handle { background-color: #313244; }")
        main_layout.addWidget(self.main_splitter)

        # Sidebar
        self.sidebar_widget = QWidget()
        self.sidebar_widget.setStyleSheet("background-color: #181825; border-radius: 8px;")
        sidebar_layout = QVBoxLayout(self.sidebar_widget)
        sidebar_layout.setContentsMargins(10, 10, 10, 10)
        sidebar_layout.setSpacing(10)
        
        self.new_note_btn = QPushButton("+ New Note")
        self.new_note_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.new_note_btn.clicked.connect(self.create_new_note)
        self.new_note_btn.setStyleSheet("""
            QPushButton { 
                background-color: #89b4fa; 
                color: #11111b; 
                border: none; 
                border-radius: 6px; 
                padding: 8px; 
                font-weight: bold; 
                text-align: center; 
            } 
            QPushButton:hover { 
                background-color: #b4befe; 
            }
        """)
        sidebar_layout.addWidget(self.new_note_btn)
        
        self.search_bar = QLineEdit()
        self.search_bar.setPlaceholderText("Search files (Ctrl+P)...")
        self.search_bar.setStyleSheet("padding: 6px; background: #181825; color: #cdd6f4; border: 1px solid #313244; border-radius: 4px;")
        self.search_bar.returnPressed.connect(self.open_quick_switcher)
        sidebar_layout.addWidget(self.search_bar)

        self.file_model = QFileSystemModel()
        self.file_model.setRootPath(self.base_dir)
        self.file_model.setNameFilters(["*.md", "*.txt"])
        self.file_model.setNameFilterDisables(False)
        
        self.tree_view = QTreeView()
        self.tree_view.setModel(self.file_model)
        self.tree_view.setRootIndex(self.file_model.index(self.base_dir))
        self.tree_view.setColumnHidden(1, True) 
        self.tree_view.setColumnHidden(2, True) 
        self.tree_view.setColumnHidden(3, True) 
        self.tree_view.setHeaderHidden(True)
        self.tree_view.clicked.connect(self.on_file_clicked)
        self.tree_view.setStyleSheet("""
            QTreeView { 
                background-color: #181825; 
                color: #a6adc8; 
                border: none; 
            } 
            QTreeView::item:hover { 
                background-color: #313244; 
            } 
            QTreeView::item:selected { 
                background-color: #89b4fa; 
                color: #11111b; 
                font-weight: bold; 
            }
        """)
        sidebar_layout.addWidget(self.tree_view)
        
        self.main_splitter.addWidget(self.sidebar_widget)

        # Editor + Preview Area
        editor_widget = QWidget()
        editor_layout = QVBoxLayout(editor_widget)
        editor_layout.setContentsMargins(0, 0, 0, 0)

        self.filename_label = QLabel("No file selected")
        self.filename_label.setStyleSheet("padding: 10px; font-weight: bold; background: #181825; color: #cdd6f4; border-bottom: 1px solid #313244;")
        editor_layout.addWidget(self.filename_label)

        self.content_splitter = QSplitter(Qt.Orientation.Horizontal)
        self.content_splitter.setStyleSheet("QSplitter::handle { background-color: #313244; }")
        
        self.editor = Editor()
        self.editor.textChanged.connect(self.on_text_changed)
        self.content_splitter.addWidget(self.editor)

        self.preview = QTextBrowser()
        self.preview.setOpenExternalLinks(True)
        self.preview.setStyleSheet("QTextBrowser { background-color: #1e1e2e; border: none; padding: 12px; }")
        self.content_splitter.addWidget(self.preview)
        
        self.content_splitter.setStretchFactor(0, 1)
        self.content_splitter.setStretchFactor(1, 1)

        editor_layout.addWidget(self.content_splitter)
        self.main_splitter.addWidget(editor_widget)

        self.main_splitter.setStretchFactor(0, 1) 
        self.main_splitter.setStretchFactor(1, 4) 

        # Status Bar
        self.setup_status_bar()

        # Timers
        self.render_timer = QTimer()
        self.render_timer.setSingleShot(True)
        self.render_timer.timeout.connect(self.update_preview)

        self.autosave_timer = QTimer()
        self.autosave_timer.setInterval(2000) 
        self.autosave_timer.timeout.connect(self.save_current_file)
        self.autosave_timer.start()

        # Keyboard Shortcuts
        self.setup_shortcuts()

        logging.info(f"UI Initialized with root: {self.base_dir}")

    def setup_theme(self):
        palette = self.palette()
        palette.setColor(QPalette.ColorRole.Window, QColor("#1e1e2e"))
        palette.setColor(QPalette.ColorRole.WindowText, QColor("#cdd6f4"))
        self.setPalette(palette)
        self.setStyleSheet("""
            QMainWindow {
                background-color: #1e1e2e;
            }
        """)

    def setup_status_bar(self):
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.setStyleSheet("background-color: #181825; color: #a6adc8; border-top: 1px solid #313244;")

        self.save_indicator = QLabel("● Saved")
        self.save_indicator.setStyleSheet("color: #a6e3a1; font-weight: bold; margin-right: 12px;")
        self.status_bar.addPermanentWidget(self.save_indicator)

        self.stats_label = QLabel("0 words  |  0 chars")
        self.stats_label.setStyleSheet("color: #cdd6f4; margin-right: 12px;")
        self.status_bar.addPermanentWidget(self.stats_label)

        self.status_bar.showMessage("Ready")

    def setup_shortcuts(self):
        # Quick Switcher: Ctrl+P and Ctrl+K
        self.shortcut_ctrl_p = QShortcut(QKeySequence("Ctrl+P"), self)
        self.shortcut_ctrl_p.activated.connect(self.open_quick_switcher)

        self.shortcut_ctrl_k = QShortcut(QKeySequence("Ctrl+K"), self)
        self.shortcut_ctrl_k.activated.connect(self.open_quick_switcher)

        # View Mode Cycle: Ctrl+E
        self.shortcut_ctrl_e = QShortcut(QKeySequence("Ctrl+E"), self)
        self.shortcut_ctrl_e.activated.connect(self.toggle_view_mode)

        # Zen Mode: F11 and Ctrl+\
        self.shortcut_f11 = QShortcut(QKeySequence("F11"), self)
        self.shortcut_f11.activated.connect(self.toggle_zen_mode)

        self.shortcut_ctrl_backslash = QShortcut(QKeySequence("Ctrl+\\"), self)
        self.shortcut_ctrl_backslash.activated.connect(self.toggle_zen_mode)

    def open_quick_switcher(self):
        dialog = QuickSwitcherDialog(self.base_dir, self)
        dialog.file_selected.connect(self.open_file_by_path)
        dialog.exec()

    def toggle_view_mode(self):
        """Cycles DUAL -> EDIT -> PREVIEW -> DUAL on Ctrl+E."""
        self.view_mode = ViewMode((self.view_mode + 1) % 3)
        if self.view_mode == ViewMode.DUAL:
            self.editor.show()
            self.preview.show()
            self.update_preview()
            half = max(200, self.content_splitter.width() // 2)
            self.content_splitter.setSizes([half, half])
            self.status_bar.showMessage("View: Dual Pane", 1500)
        elif self.view_mode == ViewMode.EDIT:
            self.editor.show()
            self.preview.hide()
            self.status_bar.showMessage("View: Editor Only", 1500)
        elif self.view_mode == ViewMode.PREVIEW:
            self.update_preview()
            self.editor.hide()
            self.preview.show()
            self.status_bar.showMessage("View: Preview Only", 1500)

    def toggle_zen_mode(self):
        r"""Toggles sidebar and centers editor text margins on F11 / Ctrl+\."""
        self.is_zen_mode = not getattr(self, 'is_zen_mode', False)
        if self.is_zen_mode:
            self.sidebar_widget.hide()
            self._apply_zen_margins()
            self.status_bar.showMessage("Zen Mode Enabled (Press F11 to exit)", 2500)
        else:
            self.sidebar_widget.show()
            self.editor.setViewportMargins(10, 10, 10, 10)
            self.status_bar.showMessage("Zen Mode Disabled", 1500)

    def _apply_zen_margins(self):
        total_w = self.editor.width()
        side_margin = max(40, (total_w - 760) // 2) if total_w > 860 else 30
        self.editor.setViewportMargins(side_margin, 24, side_margin, 24)

    def resizeEvent(self, a0):  # type: ignore[override]
        super().resizeEvent(a0)
        if getattr(self, 'is_zen_mode', False):
            self._apply_zen_margins()

    def update_live_stats(self):
        text = self.editor.toPlainText()
        char_count = len(text)
        word_count = len(text.split())
        self.stats_label.setText(f"{word_count:,} words  |  {char_count:,} chars")
        
        doc = self.editor.document()
        if doc is not None and doc.isModified():
            self.save_indicator.setText("● Unsaved")
            self.save_indicator.setStyleSheet("color: #fab387; font-weight: bold; margin-right: 12px;")
        else:
            self.save_indicator.setText("● Saved")
            self.save_indicator.setStyleSheet("color: #a6e3a1; font-weight: bold; margin-right: 12px;")

    def read_file_task(self, path):
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()

    def on_file_loaded(self, content):
        self.editor.setPlainText(content)
        doc = self.editor.document()
        if doc is not None:
            doc.setModified(False)
        self.update_live_stats()
        self.update_preview()
        self.editor.setDisabled(False)
        self.status_bar.showMessage("File loaded", 2000)

    def on_file_load_error(self, err):
        self.editor.setDisabled(False)
        logging.error(f"Error loading file: {err}")
        self.status_bar.showMessage(f"Error loading file: {err[1]}", 5000)

    def open_file_by_path(self, path: str):
        if not path or not os.path.exists(path) or os.path.isdir(path):
            return
        self.save_current_file()
        self.current_file = path
        self.filename_label.setText(os.path.basename(path))
        self.editor.setDisabled(True)
        self.status_bar.showMessage(f"Loading {os.path.basename(path)}...")
        worker = Worker(self.read_file_task, path)
        worker.signals.result.connect(self.on_file_loaded)
        worker.signals.error.connect(self.on_file_load_error)
        self.threadpool.start(worker)

        index = self.file_model.index(path)
        if index.isValid():
            self.tree_view.setCurrentIndex(index)

    def on_file_clicked(self, index):
        path = self.file_model.filePath(index)
        if os.path.isdir(path):
            return
        self.open_file_by_path(path)

    def on_text_changed(self):
        self.update_live_stats()
        self.render_timer.start(300) 

    def update_preview(self):
        text = self.editor.toPlainText()
        html = render_markdown(text)
        self.preview.setHtml(html)

    def write_file_task(self, path, content):
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return path

    def on_save_complete(self, path):
        logging.info(f"Auto-saved: {path}")
        self.status_bar.showMessage("Saved", 1000)
        doc = self.editor.document()
        if doc is not None:
            doc.setModified(False)
        self.save_indicator.setText("● Saved")
        self.save_indicator.setStyleSheet("color: #a6e3a1; font-weight: bold; margin-right: 12px;")

    def on_save_error(self, err):
        logging.error(f"Failed to save: {err}")
        self.status_bar.showMessage(f"Save failed: {err[1]}", 5000)
        self.save_indicator.setText("● Unsaved")
        self.save_indicator.setStyleSheet("color: #f38ba8; font-weight: bold; margin-right: 12px;")

    def save_current_file(self):
        doc = self.editor.document()
        if self.current_file and doc is not None and doc.isModified():
            self.save_indicator.setText("⟳ Saving...")
            self.save_indicator.setStyleSheet("color: #89b4fa; font-weight: bold; margin-right: 12px;")
            content = self.editor.toPlainText()
            worker = Worker(self.write_file_task, self.current_file, content)
            worker.signals.result.connect(self.on_save_complete)
            worker.signals.error.connect(self.on_save_error)
            self.threadpool.start(worker)

    def create_new_note(self):
        import time
        filename = f"Untitled-{int(time.time())}.md"
        filepath = os.path.join(self.base_dir, filename)
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write("# New Note\n\nStart writing here...")
            logging.info(f"Created new note: {filepath}")
            self.status_bar.showMessage(f"Created {filename}", 2000)
            self.open_file_by_path(filepath)
        except Exception as e:
            self.status_bar.showMessage(f"Failed to create note: {e}", 5000)
            logging.error(f"Failed to create note: {e}")

    def closeEvent(self, a0):  # type: ignore[override]
        self.save_current_file()
        if a0 is not None:
            a0.accept()

import os
import sys
import logging
from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QSplitter, 
    QPlainTextEdit, QTreeView, QFileDialog, 
    QMessageBox, QLabel, QLineEdit, QPushButton
)
from PyQt6.QtCore import Qt, QDir, QTimer, QUrl
from PyQt6.QtGui import QAction, QIcon, QFont, QColor, QPalette, QFileSystemModel
from PyQt6.QtWebEngineWidgets import QWebEngineView

from .renderer import render_markdown

class Editor(QPlainTextEdit):
    def __init__(self):
        super().__init__()
        font = QFont("Monospace")
        font.setStyleHint(QFont.StyleHint.Monospace)
        font.setPointSize(11)
        self.setFont(font)
        self.setStyleSheet("""
            QPlainTextEdit {
                background-color: #171717;
                color: #E5E5E5;
                border: none;
                padding: 10px;
            }
        """)

class AcropadWindow(QMainWindow):
    def __init__(self, base_dir):
        super().__init__()
        self.base_dir = os.path.abspath(base_dir)
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)

        self.setWindowTitle("Acropad")
        self.resize(1200, 800)
        
        # Setup Dark Theme for Window
        self.setup_theme()

        # Main Layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(10, 10, 10, 10) # Added padding
        main_layout.setSpacing(10) # Spacing between sidebar and editor

        # Splitter
        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.setHandleWidth(2)
        splitter.setStyleSheet("QSplitter::handle { background-color: #404040; }")
        main_layout.addWidget(splitter)

        # Sidebar (File Explorer)
        self.sidebar_widget = QWidget()
        self.sidebar_widget.setStyleSheet("background-color: #0a0a0a; border-radius: 8px;")
        sidebar_layout = QVBoxLayout(self.sidebar_widget)
        sidebar_layout.setContentsMargins(10, 10, 10, 10)
        sidebar_layout.setSpacing(10)
        
        # New Note Button
        self.new_note_btn = QPushButton("+ New Note")
        self.new_note_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.new_note_btn.clicked.connect(self.create_new_note)
        self.new_note_btn.setStyleSheet("""
            QPushButton {
                background-color: #2563EB;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px;
                font-weight: bold;
                text-align: center;
            }
            QPushButton:hover {
                background-color: #1D4ED8;
            }
        """)
        sidebar_layout.addWidget(self.new_note_btn)
        
        # Search/Filter (Placeholder)
        self.search_bar = QLineEdit()
        self.search_bar.setPlaceholderText("Search files...")
        self.search_bar.setStyleSheet("padding: 5px; background: #262626; color: white; border: none;")
        sidebar_layout.addWidget(self.search_bar)

        self.file_model = QFileSystemModel()
        self.file_model.setRootPath(self.base_dir)
        self.file_model.setNameFilters(["*.md", "*.txt"])
        self.file_model.setNameFilterDisables(False)
        
        self.tree_view = QTreeView()
        self.tree_view.setModel(self.file_model)
        self.tree_view.setRootIndex(self.file_model.index(self.base_dir))
        self.tree_view.setColumnHidden(1, True) # Size
        self.tree_view.setColumnHidden(2, True) # Type
        self.tree_view.setColumnHidden(3, True) # Date
        self.tree_view.setHeaderHidden(True)
        self.tree_view.clicked.connect(self.on_file_clicked)
        self.tree_view.setStyleSheet("""
            QTreeView {
                background-color: #0a0a0a;
                color: #a3a3a3;
                border: none;
            }
            QTreeView::item:hover {
                background-color: #262626;
            }
            QTreeView::item:selected {
                background-color: #2563EB;
                color: white;
            }
        """)
        sidebar_layout.addWidget(self.tree_view)
        
        splitter.addWidget(self.sidebar_widget)

        # Editor Area
        editor_widget = QWidget()
        editor_layout = QVBoxLayout(editor_widget)
        editor_layout.setContentsMargins(0,0,0,0)

        # Editor Toolbar
        self.filename_label = QLabel("No file selected")
        self.filename_label.setStyleSheet("padding: 10px; font-weight: bold; background: #171717; color: #737373;")
        editor_layout.addWidget(self.filename_label)

        content_splitter = QSplitter(Qt.Orientation.Horizontal)
        
        self.editor = Editor()
        self.editor.textChanged.connect(self.on_text_changed)
        content_splitter.addWidget(self.editor)

        self.preview = QWebEngineView()
        self.preview.setStyleSheet("background-color: #171717;")
        content_splitter.addWidget(self.preview)
        
        content_splitter.setStretchFactor(0, 1)
        content_splitter.setStretchFactor(1, 1)

        editor_layout.addWidget(content_splitter)
        splitter.addWidget(editor_widget)

        splitter.setStretchFactor(0, 1) # Sidebar width
        splitter.setStretchFactor(1, 4) # Editor width

        self.current_file = None
        
        # Debounce Rendering
        self.render_timer = QTimer()
        self.render_timer.setSingleShot(True)
        self.render_timer.timeout.connect(self.update_preview)

        # Auto-Save Timer
        self.autosave_timer = QTimer()
        self.autosave_timer.setInterval(2000) # 2 seconds
        self.autosave_timer.timeout.connect(self.save_current_file)
        self.autosave_timer.start()

        logging.info(f"UI Initialized with root: {self.base_dir}")

    def setup_theme(self):
        palette = self.palette()
        palette.setColor(QPalette.ColorRole.Window, QColor("#171717"))
        palette.setColor(QPalette.ColorRole.WindowText, QColor("#E5E5E5"))
        self.setPalette(palette)

    def on_file_clicked(self, index):
        path = self.file_model.filePath(index)
        if os.path.isdir(path):
            return
        
        # Save previous if needed (handled by autosave mostly, but force save here)
        self.save_current_file()
        
        self.current_file = path
        self.filename_label.setText(os.path.basename(path))
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            self.editor.setPlainText(content)
            self.update_preview()
            logging.info(f"Opened file: {path}")
        except Exception as e:
            logging.error(f"Failed to open file {path}: {e}")
            QMessageBox.critical(self, "Error", f"Could not read file:\n{e}")

    def on_text_changed(self):
        self.render_timer.start(300) # Wait 300ms after typing stops

    def update_preview(self):
        text = self.editor.toPlainText()
        html = render_markdown(text)
        # Use setHtml with base url to resolve relative images if needed
        base_url = QUrl.fromLocalFile(self.base_dir + os.sep)
        self.preview.setHtml(html, base_url)

    def save_current_file(self):
        if self.current_file and self.editor.document().isModified():
            try:
                with open(self.current_file, 'w', encoding='utf-8') as f:
                    f.write(self.editor.toPlainText())
                self.editor.document().setModified(False)
                logging.info(f"Auto-saved: {self.current_file}")
            except Exception as e:
                logging.error(f"Failed to save {self.current_file}: {e}")

    def create_new_note(self):
        import time
        filename = f"Untitled-{int(time.time())}.md"
        filepath = os.path.join(self.base_dir, filename)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write("# New Note\n\nStart writing here...")
            
            logging.info(f"Created new note: {filepath}")
            
            # Select and Open the new file
            # We need to wait a bit for the filesystem watcher to pick it up (or force refresh)
            # For simplicity, we just manually load it if it exists
            index = self.file_model.index(filepath)
            if index.isValid():
                self.tree_view.setCurrentIndex(index)
                self.on_file_clicked(index)
            else:
                # If fs model hasn't updated yet, just open it directly
                self.current_file = filepath
                self.filename_label.setText(filename)
                self.editor.setPlainText("# New Note\n\nStart writing here...")
                self.update_preview()

        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to create note: {e}")

    def closeEvent(self, event):
        self.save_current_file()
        event.accept()

"""
Acropad - A Simplified Obsidian Clone
A modern, minimalist note-taking application built with CustomTkinter.

Features:
- Dark mode UI similar to VS Code/Obsidian
- Vault support (open folders as workspaces)
- Markdown file support (.md, .txt)
- Auto-save functionality
- Clean, beginner-friendly codebase
"""

import customtkinter as ctk
from tkinter import filedialog, messagebox
from pathlib import Path
import json
import threading
import time
from datetime import datetime
import os

# Set the appearance mode and theme
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("dark-blue")


class AcropadApp(ctk.CTk):
    """
    Main application class for Acropad.
    Handles UI, file operations, and application logic.
    """

    def __init__(self):
        """Initialize the Acropad application."""
        super().__init__()

        # Window configuration
        self.title("Acropad")
        self.geometry("1200x800")
        self.minsize(900, 600)

        # Application state
        self.vault_path = None
        self.files_list = []
        self.current_file_path = None
        self.auto_save_interval = 2  # Auto-save every 2 seconds
        self.is_modified = False
        self.auto_save_thread = None
        self.running = True

        # Configuration file for storing recent vault
        self.config_file = Path.home() / ".acropad_config.json"

        # Setup UI
        self._create_layout()
        self._create_sidebar()
        self._create_editor()

        # Load last vault if it exists
        self._load_last_vault()

        # Start auto-save thread
        self._start_auto_save()

        # Handle window close
        self.protocol("WM_DELETE_WINDOW", self._on_close)

    def _create_layout(self):
        """Create the main grid layout."""
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=0)  # Sidebar fixed width
        self.grid_columnconfigure(1, weight=1)  # Editor expands

    def _create_sidebar(self):
        """Create the left sidebar for navigation."""
        self.sidebar = ctk.CTkFrame(self, fg_color="#181818", width=260, corner_radius=0)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_rowconfigure(3, weight=1)  # List expands

        # Title
        ctk.CTkLabel(
            self.sidebar,
            text="ACROPAD",
            font=("Consolas", 20, "bold"),
            text_color="#3B8ED0",
        ).grid(row=0, column=0, padx=20, pady=(20, 10), sticky="w")

        # Action Buttons
        self.btn_open_vault = ctk.CTkButton(
            self.sidebar,
            text="Open Vault",
            command=self._open_vault,
            fg_color="#2B2D31",
            hover_color="#3F4148",
            width=220,
        )
        self.btn_open_vault.grid(row=1, column=0, padx=20, pady=5)

        self.btn_new_file = ctk.CTkButton(
            self.sidebar,
            text="New Note",
            command=self._new_file,
            fg_color="#3B8ED0",
            hover_color="#36719F",
            width=220,
        )
        self.btn_new_file.grid(row=2, column=0, padx=20, pady=5)

        # Vault Name Label
        self.lbl_vault_name = ctk.CTkLabel(
            self.sidebar,
            text="No vault open",
            font=("Arial", 12),
            text_color="#808080",
        )
        self.lbl_vault_name.grid(row=4, column=0, padx=20, pady=(10, 5), sticky="w")

        # File List Container
        self.file_list_frame = ctk.CTkScrollableFrame(
            self.sidebar,
            fg_color="transparent",
            label_text="FILES",
            label_text_color="#808080",
        )
        self.file_list_frame.grid(row=3, column=0, sticky="nsew", padx=10, pady=10)

    def _create_editor(self):
        """Create the right editor area."""
        self.editor_container = ctk.CTkFrame(self, fg_color="#1E1E1E", corner_radius=0)
        self.editor_container.grid(row=0, column=1, sticky="nsew")
        self.editor_container.grid_rowconfigure(1, weight=1)
        self.editor_container.grid_columnconfigure(0, weight=1)

        # Top Bar (Filename + Status)
        self.top_bar = ctk.CTkFrame(self.editor_container, fg_color="#252526", height=40, corner_radius=0)
        self.top_bar.grid(row=0, column=0, sticky="ew")
        
        self.lbl_filename = ctk.CTkLabel(
            self.top_bar,
            text="Welcome",
            font=("Segoe UI", 14),
            text_color="#CCCCCC",
        )
        self.lbl_filename.pack(side="left", padx=20, pady=10)

        self.lbl_status = ctk.CTkLabel(
            self.top_bar,
            text="",
            font=("Segoe UI", 12),
            text_color="#6A9955",
        )
        self.lbl_status.pack(side="right", padx=20, pady=10)

        # Main Text Editor
        self.editor = ctk.CTkTextbox(
            self.editor_container,
            fg_color="#1E1E1E",
            text_color="#D4D4D4",
            font=("Consolas", 14),
            corner_radius=0,
            undo=True,
            wrap="word",
        )
        self.editor.grid(row=1, column=0, sticky="nsew", padx=0, pady=0)
        
        # Bind key release to track changes
        self.editor.bind("<KeyRelease>", self._on_text_change)
        
        # Default welcome message
        self.editor.insert("0.0", "# Welcome to Acropad\n\nOpen a vault or create a new file to get started.")

    def _open_vault(self):
        """Open a directory as a vault."""
        path = filedialog.askdirectory()
        if path:
            self.vault_path = Path(path)
            self.lbl_vault_name.configure(text=f"📂 {self.vault_path.name}")
            self._save_config()
            self._refresh_file_list()

    def _refresh_file_list(self):
        """Scan vault for .md and .txt files."""
        if not self.vault_path:
            return

        # Clear existing buttons
        for widget in self.file_list_frame.winfo_children():
            widget.destroy()

        self.files_list = []
        extensions = ['*.md', '*.txt']
        
        try:
            for ext in extensions:
                self.files_list.extend(list(self.vault_path.rglob(ext)))
            
            self.files_list.sort()

            for file_path in self.files_list:
                self._add_file_button(file_path)
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to scan vault: {e}")

    def _add_file_button(self, file_path):
        """Add a button for a file in the sidebar."""
        try:
            rel_path = file_path.relative_to(self.vault_path)
            name = str(rel_path)
        except ValueError:
            name = file_path.name

        btn = ctk.CTkButton(
            self.file_list_frame,
            text=name,
            command=lambda p=file_path: self._open_file(p),
            fg_color="transparent",
            text_color="#CCCCCC",
            hover_color="#37373D",
            anchor="w",
            height=28,
        )
        btn.pack(fill="x", pady=1)

    def _new_file(self):
        """Create a new file."""
        if not self.vault_path:
            messagebox.showwarning("Warning", "Open a vault first!")
            return

        dialog = ctk.CTkInputDialog(text="Enter file name (without extension):", title="New Note")
        filename = dialog.get_input()
        
        if filename:
            # Sanitize filename
            filename = "".join(c for c in filename if c.isalnum() or c in (' ', '-', '_'))
            new_path = self.vault_path / f"{filename}.md"
            
            if new_path.exists():
                messagebox.showerror("Error", "File already exists!")
                return
                
            try:
                new_path.touch()
                self._refresh_file_list()
                self._open_file(new_path)
            except Exception as e:
                messagebox.showerror("Error", f"Could not create file: {e}")

    def _open_file(self, file_path):
        """Open a specific file."""
        if self.is_modified:
            self._save_file()

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            self.current_file_path = file_path
            self.editor.delete("0.0", "end")
            self.editor.insert("0.0", content)
            
            self.lbl_filename.configure(text=f"📄 {file_path.name}")
            self.lbl_status.configure(text="Saved", text_color="#6A9955")
            self.is_modified = False
            
        except Exception as e:
            messagebox.showerror("Error", f"Could not open file: {e}")

    def _on_text_change(self, event=None):
        """Mark file as modified."""
        if self.current_file_path and not self.is_modified:
            self.is_modified = True
            self.lbl_status.configure(text="● Unsaved", text_color="#DCDCAA")

    def _save_file(self):
        """Save the current file."""
        if self.current_file_path and self.is_modified:
            try:
                content = self.editor.get("0.0", "end")
                # Remove extra newline added by Text widget at end
                if content.endswith("\n"):
                    content = content[:-1]
                    
                with open(self.current_file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                
                self.is_modified = False
                self.lbl_status.configure(text="Saved", text_color="#6A9955")
                
            except Exception as e:
                print(f"Error saving: {e}")

    def _start_auto_save(self):
        """Run auto-save in background."""
        def worker():
            while self.running:
                time.sleep(self.auto_save_interval)
                if self.is_modified:
                    self.after(0, self._save_file) # Thread-safe call to GUI

        self.auto_save_thread = threading.Thread(target=worker, daemon=True)
        self.auto_save_thread.start()

    def _load_last_vault(self):
        """Load last used vault from config."""
        if self.config_file.exists():
            try:
                with open(self.config_file, "r") as f:
                    data = json.load(f)
                    path = data.get("vault_path")
                    if path and os.path.exists(path):
                        self.vault_path = Path(path)
                        self.lbl_vault_name.configure(text=f"📂 {self.vault_path.name}")
                        self._refresh_file_list()
            except:
                pass

    def _save_config(self):
        """Save current vault to config."""
        try:
            with open(self.config_file, "w") as f:
                json.dump({"vault_path": str(self.vault_path)}, f)
        except:
            pass

    def _on_close(self):
        """Clean up before closing."""
        self.running = False
        if self.is_modified:
            self._save_file()
        self.destroy()

if __name__ == "__main__":
    app = AcropadApp()
    app.mainloop()

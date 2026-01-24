import sys
import os
import logging
from PyQt6.QtWidgets import QApplication

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("acropad.log", mode='w')
    ]
)

def exception_hook(exctype, value, traceback):
    logging.critical("Uncaught exception", exc_info=(exctype, value, traceback))
    sys.__excepthook__(exctype, value, traceback)

sys.excepthook = exception_hook

from ui import AcropadWindow

def main():
    logging.info("Starting Acropad...")
    
    # Optimize for Wayland/Hyprland (auto-detect)
    session_type = os.environ.get("XDG_SESSION_TYPE", "").lower()
    if "wayland" in session_type:
        # Use wayland with xcb fallback for Hyprland/Wayland compatibility
        os.environ["QT_QPA_PLATFORM"] = "wayland"
        os.environ["QT_AUTO_SCREEN_SCALE_FACTOR"] = "1"
        logging.info("Detected Wayland session - using wayland platform plugin")
    
    app = QApplication(sys.argv)
    app.setApplicationName("Acropad")

    # Determine initial directory
    # If running as binary, current dir. If dev, project root.
    base_dir = os.path.join(os.getcwd(), "notes")
    
    try:
        window = AcropadWindow(base_dir)
        window.show()
        logging.info("Window shown successfully.")
        sys.exit(app.exec())
    except Exception as e:
        logging.critical(f"Fatal error initializing app: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()

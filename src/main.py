import sys
import os
import logging
from PyQt6.QtWidgets import QApplication

# Add project root to sys.path to ensure imports work
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

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

from src.ui import AcropadWindow

def main():
    logging.info("Starting Acropad...")
    
    # Fix for some Wayland/Hyprland setups if needed
    # os.environ["QT_QPA_PLATFORM"] = "wayland;xcb" 
    
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

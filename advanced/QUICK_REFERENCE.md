# Acropad Advanced - Quick Reference Guide

## 🚀 Quick Start (5 Minutes)

### Installation

```bash
# 1. Install prerequisites
# - Flutter SDK 3.13+
# - Rust 1.70+
# - Your preferred IDE (VS Code recommended)

# 2. Navigate to project
cd /path/to/Acropad/advanced

# 3. Install Dart dependencies
flutter pub get

# 4. Build Rust backend
cd native
cargo build --release
cd ..

# 5. Run the app
flutter run -d linux   # Linux
flutter run -d macos   # macOS
flutter run -d windows # Windows
```

---

## 📁 File Organization

| Purpose | Location | Contains |
|---------|----------|----------|
| **UI Code** | `lib/ui/` | Widgets, screens, layouts |
| **Business Logic** | `lib/bloc/` | State management (BLoC pattern) |
| **Data Models** | `lib/models/` | FileModel, VaultModel |
| **Services** | `lib/services/` | Native bridge (Rust FFI) |
| **Backend** | `native/src/` | Rust code (file I/O, search) |
| **Configuration** | `.` | pubspec.yaml, Cargo.toml |

---

## 🏗️ Architecture at a Glance

```
User Input (UI)
    ↓
Widget Event (Flutter)
    ↓
BLoC Handler (State Management)
    ↓
NativeBridge (FFI)
    ↓
Rust Backend (Performance)
    ↓
File System (I/O)
    ↓
Result back through stack
    ↓
BLoC emits State
    ↓
UI Rebuilds
```

---

## 🔧 Key Concepts

### 1. **BLoC Pattern**
- **Event**: User action → `OpenFileEvent(path)`
- **State**: Data state → `EditorState(currentFile, isModified)`
- **Process**: Bloc listens to events → emits new states

```dart
context.read<EditorBloc>().add(OpenFileEvent(path));
// → EditorBloc processes
// → emits EditorState(currentFile: loaded)
// → Widget rebuilds
```

### 2. **Models**
- **FileModel**: Represents a file with metadata
- **VaultModel**: Represents a vault (folder) with file list

### 3. **Native Bridge (FFI)**
- Dart calls Rust functions via FFI
- Non-blocking I/O (happens on background thread)
- Memory safely managed

### 4. **Rust Backend**
- High-performance file operations
- Buffered I/O for speed
- Parallelized directory scanning

---

## 📝 Common Tasks

### Adding a New Feature

#### Step 1: Create Model
```dart
// lib/models/my_model.dart
class MyModel extends Equatable {
  final String id;
  final String data;
  
  const MyModel({required this.id, required this.data});
  
  @override
  List<Object?> get props => [id, data];
}
```

#### Step 2: Create Events & States
```dart
// lib/bloc/my_event.dart
class MyEvent extends MyBlocEvent { ... }

// lib/bloc/my_state.dart
class MyBlocState extends Equatable { 
  final MyModel? data;
  // ...
}
```

#### Step 3: Create BLoC Handler
```dart
// lib/bloc/my_bloc.dart
class MyBloc extends Bloc<MyBlocEvent, MyBlocState> {
  MyBloc() : super(const MyBlocState()) {
    on<MyEvent>(_onMyEvent);
  }
  
  Future<void> _onMyEvent(MyEvent event, Emitter emit) async {
    // Handle event
  }
}
```

#### Step 4: Wire to UI
```dart
BlocBuilder<MyBloc, MyBlocState>(
  builder: (context, state) {
    return Text(state.data?.data ?? 'Loading');
  },
)
```

### Adding Rust Function

#### Step 1: Write in Rust
```rust
// native/src/my_function.rs
pub fn my_function(input: &str) -> Result<String> {
    Ok(input.to_uppercase())
}

// Export to FFI
#[no_mangle]
pub extern "C" fn my_function_ffi(input: *const u8, len: usize) -> *mut u8 {
    // Convert, call, return
}
```

#### Step 2: Add Dart Binding
```dart
// lib/services/native_bridge.dart
static Future<String> myFunction(String input) async {
  return Future(() {
    final ptr = input.toNativeUtf8();
    try {
      final result = _myFunction(ptr.cast<Uint8>(), input.length);
      return result.cast<Utf8>().toDartString();
    } finally {
      malloc.free(ptr);
    }
  });
}
```

#### Step 3: Use in BLoC
```dart
final result = await NativeBridge.myFunction('hello');
```

---

## 🐛 Debugging

### Flutter Debugging
```bash
# Run with verbose logging
flutter run -v

# Use debugger in VS Code
# Set breakpoints and press F5

# Hot reload (applies changes without restart)
# Press 'r' in terminal
```

### Rust Debugging
```bash
# Build with debug symbols
cd native && cargo build && cd ..

# Run tests
cd native && cargo test && cd ..

# Check for compilation warnings
cd native && cargo check && cd ..
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "FFI library not found" | `cd native && cargo build --release && cd ..` |
| "Flutter version mismatch" | `flutter upgrade && flutter pub get` |
| "Rust not installed" | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| "Slow on large files" | Ensure Rust built in release mode |
| "Memory leak" | Call `free_string()` after reading from FFI |

---

## 📊 Performance Tips

1. **Use Release Build**
   ```bash
   flutter run --release -d linux
   ```

2. **Profile App**
   ```bash
   flutter run --profile -d linux
   # Then check DevTools
   ```

3. **Optimize Rust**
   - Verify `Cargo.toml` has `[profile.release]` with `opt-level = 3`
   - Use `cargo build --release` always

4. **UI Optimization**
   - Use `const` widgets
   - Avoid rebuilding full screen
   - Use `BlocBuilder` with specific states

---

## 🧪 Testing

### Run All Tests
```bash
flutter test                    # Dart tests
cd native && cargo test && cd .. # Rust tests
```

### Example Test

**Dart:**
```dart
testWidgets('EditorPane displays content', (tester) async {
  await tester.pumpWidget(const AcropadApp());
  expect(find.byType(EditorPane), findsOneWidget);
});

test('FileModel copyWith works', () {
  final file = FileModel(...);
  final updated = file.copyWith(isModified: true);
  expect(updated.isModified, true);
});
```

**Rust:**
```rust
#[test]
fn test_read_file() {
    let result = FileHandler::read_file("test.txt");
    assert!(result.is_ok());
}
```

---

## 📦 Build & Distribution

### Build for Release

**Linux:**
```bash
flutter build linux --release
# Output: build/linux/x64/release/bundle/
```

**macOS:**
```bash
flutter build macos --release
# Output: build/macos/Build/Products/Release/
```

**Windows:**
```bash
flutter build windows --release
# Output: build/windows/runner/Release/
```

### Create Installer

```bash
# Requires flutter_distributor
flutter pub global activate flutter_distributor

flutter_distributor package --platform windows --targets exe
flutter_distributor package --platform macos --targets dmg
flutter_distributor package --platform linux --targets deb
```

---

## 🔍 Code Navigation

### Finding Things

```bash
# Find all files of type
find lib -name "*bloc*"

# Search for keyword
grep -r "OpenFileEvent" lib/

# Find class definition
grep -n "class EditorBloc" lib/bloc/editor_bloc.dart
```

### VS Code Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` | Go to file |
| `Ctrl+Shift+F` | Global find |
| `F12` | Go to definition |
| `Ctrl+Alt+H` | Find references |
| `F5` | Start debugging |

---

## 📚 Project Dependencies

### Dart (pubspec.yaml)
- **flutter_bloc**: State management
- **google_fonts**: Typography
- **path_provider**: File system access
- **flutter_rust_bridge**: FFI utilities

### Rust (Cargo.toml)
- **tokio**: Async runtime
- **walkdir**: Directory traversal
- **regex**: Text searching
- **serde/serde_json**: Serialization
- **rayon**: Parallelization

---

## 🚀 Deployment Checklist

- [ ] Update version in `pubspec.yaml`
- [ ] Update version in `native/Cargo.toml`
- [ ] Build Rust: `cd native && cargo build --release && cd ..`
- [ ] Run tests: `flutter test && cd native && cargo test && cd ..`
- [ ] Build for all platforms
- [ ] Test on each platform
- [ ] Update CHANGELOG.md
- [ ] Create GitHub release
- [ ] Upload binaries

---

## 🔗 Important Links

- **Flutter Docs**: https://flutter.dev/docs
- **BLoC Library**: https://bloclibrary.dev
- **Rust FFI**: https://docs.rust-embedded.org/book/c-language-bindings.html
- **Obsidian**: https://obsidian.md
- **Project Repo**: [Your GitHub URL]

---

## 💡 Best Practices

### Dart
✓ Use `const` where possible
✓ Immutable models (use Equatable)
✓ Descriptive event/state names
✓ Error handling in BLoC

### Rust
✓ Use `Result<T>` for fallible operations
✓ Write tests alongside code
✓ Document public functions
✓ Use `#[no_mangle]` for FFI exports

### General
✓ Commit frequently
✓ Write comments for complex logic
✓ Keep UI and business logic separate
✓ Profile before optimizing

---

## 🎓 Learning Resources

### For Beginners
1. Start with `lib/main.dart` - understand app structure
2. Read `lib/bloc/editor_bloc.dart` - understand BLoC pattern
3. Modify UI in `lib/ui/screens/main_screen.dart`
4. Read `native/src/file_handler.rs` - understand Rust

### For Intermediate
1. Add new BLoC events & states
2. Write Rust helper functions
3. Integrate new native functions
4. Add UI features using Flutter widgets

### For Advanced
1. Implement plugin system
2. Optimize hot paths in Rust
3. Add encryption layer
4. Build custom widgets

---

## 📞 Support & Contribution

### Report Issues
- GitHub Issues: Describe bug, steps to reproduce, expected vs actual
- Include logs: `flutter run -v` output

### Contribute
1. Fork repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Create Pull Request

---

**Quick Reference Complete! Happy Coding! 🎉**

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:file_picker/file_picker.dart';
import 'package:path/path.dart' as p;
import '../../bloc/editor_bloc.dart';
import '../../bloc/vault_bloc.dart';

/// Editor pane widget with support for tabbed interface.
/// 
/// Features:
/// - Monospace font for code/markdown
/// - Syntax highlighting ready
/// - Tab support for multiple files (future)
/// - Auto-save integration
class EditorPane extends StatefulWidget {
  const EditorPane({Key? key}) : super(key: key);

  @override
  State<EditorPane> createState() => _EditorPaneState();
}

class _EditorPaneState extends State<EditorPane> {
  late TextEditingController _textController;

  @override
  void initState() {
    super.initState();
    _textController = TextEditingController();
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<EditorBloc, EditorState>(
      listener: (context, state) {
        if (state.error.isNotEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.error),
              backgroundColor: Colors.red[700],
            ),
          );
        }
      },
      child: BlocBuilder<EditorBloc, EditorState>(
        builder: (context, state) {
          // Update text when file changes
          if (state.currentFile != null && 
              _textController.text != state.currentFile!.content) {
            _textController.text = state.currentFile!.content;
          }

          return Column(
            children: [
              // Tab bar (for future multi-tab support)
              _buildTabBar(context, state),
              
              // Divider
              Container(
                height: 1,
                color: const Color(0xFF404040),
              ),
              
              // Text editor
              Expanded(
                child: state.currentFile == null
                    ? _buildWelcomeScreen()
                    : _buildEditor(context, state),
              ),
            ],
          );
        },
      ),
    );
  }

  /// Build tab bar for multiple files
  Widget _buildTabBar(BuildContext context, EditorState state) {
    return Container(
      height: 40,
      color: const Color(0xFF252526),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: [
            if (state.currentFile != null)
              Row(
                children: [
                  const Icon(Icons.description, size: 14, color: Color(0xFF007ACC)),
                  const SizedBox(width: 8),
                  Text(
                    state.currentFile!.name,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.white,
                    ),
                  ),
                  if (state.currentFile!.isModified)
                    const Padding(
                      padding: EdgeInsets.only(left: 4),
                      child: Text(
                        '●',
                        style: TextStyle(
                          fontSize: 8,
                          color: Color(0xFFDCDCAA),
                        ),
                      ),
                    ),
                ],
              )
            else
              Text(
                'Welcome',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            const Spacer(),
            if (state.currentFile != null)
              IconButton(
                icon: const Icon(Icons.close, size: 16),
                color: Colors.grey[400],
                onPressed: () {
                  context.read<EditorBloc>().add(const CloseFileEvent());
                },
              ),
          ],
        ),
      ),
    );
  }

  /// Build welcome screen
  Widget _buildWelcomeScreen() {
    return Container(
      color: const Color(0xFF1E1E1E),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.description,
              size: 64,
              color: Colors.grey[700],
            ),
            const SizedBox(height: 24),
            Text(
              'Welcome to Acropad',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Open a vault or create a new file to get started',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () => _showVaultPicker(context),
              icon: const Icon(Icons.folder_open),
              label: const Text('Open Vault'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0E639C),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showVaultPicker(BuildContext context) async {
    final result = await FilePicker.platform.getDirectoryPath();
    if (result != null) {
      if (context.mounted) {
        context.read<VaultBloc>().add(OpenVaultEvent(
              vaultPath: result,
              vaultName: p.basename(result),
            ));
      }
    }
  }

  /// Build text editor
  Widget _buildEditor(BuildContext context, EditorState state) {
    return Stack(
      children: [
        // Text field with monospace font
        TextField(
          controller: _textController,
          onChanged: (value) {
            context.read<EditorBloc>().add(
              UpdateFileContentEvent(value),
            );
          },
          maxLines: null,
          expands: true,
          style: GoogleFonts.sourceCodePro(
            fontSize: 14,
            color: const Color(0xFFD4D4D4),
            height: 1.6,
          ),
          decoration: const InputDecoration(
            border: InputBorder.none,
            contentPadding: EdgeInsets.all(16),
          ),
          cursorColor: Colors.white,
        ),
        
        // Auto-save indicator
        if (state.isSaving)
          Positioned(
            bottom: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF252526),
                border: Border.all(color: const Color(0xFF404040)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 12,
                    height: 12,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Color(0xFF6A9955),
                      ),
                    ),
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Saving...',
                    style: TextStyle(
                      fontSize: 11,
                      color: Color(0xFF6A9955),
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

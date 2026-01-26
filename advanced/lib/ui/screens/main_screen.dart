import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/editor_bloc.dart';
import '../widgets/sidebar.dart';
import '../widgets/editor_pane.dart';

/// Main application screen combining sidebar and editor.
/// 
/// This screen uses a responsive layout:
/// - Collapsible sidebar for file navigation
/// - Main editor area for content editing
/// - Top toolbar for actions
class MainScreen extends StatefulWidget {
  const MainScreen({Key? key}) : super(key: key);

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  bool _sidebarCollapsed = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E1E),
      body: Row(
        children: [
          // Sidebar with animation
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            width: _sidebarCollapsed ? 50 : 280,
            child: const Sidebar(),
          ),
          
          // Divider
          Container(
            width: 1,
            color: const Color(0xFF404040),
          ),
          
          // Main editor area
          Expanded(
            child: Column(
              children: [
                // Top toolbar
                _buildTopBar(context),
                
                // Editor with tabs
                Expanded(
                  child: const EditorPane(),
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: _buildToggleSidebarButton(context),
    );
  }

  /// Build the top toolbar with file actions
  Widget _buildTopBar(BuildContext context) {
    return Container(
      height: 50,
      decoration: const BoxDecoration(
        color: Color(0xFF252526),
        border: Border(
          bottom: BorderSide(
            color: Color(0xFF404040),
            width: 1,
          ),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            // File name
            BlocBuilder<EditorBloc, EditorState>(
              builder: (context, state) {
                return Text(
                  state.currentFile?.name ?? 'Welcome to Acropad',
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                );
              },
            ),
            
            const Spacer(),
            
            // Save status
            BlocBuilder<EditorBloc, EditorState>(
              builder: (context, state) {
                final isModified = state.currentFile?.isModified ?? false;
                final isSaving = state.isSaving;
                
                return Row(
                  children: [
                    if (isSaving)
                      const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Color(0xFF6A9955),
                          ),
                        ),
                      )
                    else if (isModified)
                      const Text(
                        'Modified',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFFDCDCAA),
                        ),
                      )
                    else
                      const Text(
                        'Saved',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFF6A9955),
                        ),
                      ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  /// Build the toggle sidebar button
  Widget _buildToggleSidebarButton(BuildContext context) {
    return FloatingActionButton(
      backgroundColor: const Color(0xFF0E639C),
      onPressed: () {
        setState(() {
          _sidebarCollapsed = !_sidebarCollapsed;
        });
      },
      child: Icon(
        _sidebarCollapsed ? Icons.menu_open : Icons.menu,
        color: Colors.white,
      ),
    );
  }
}

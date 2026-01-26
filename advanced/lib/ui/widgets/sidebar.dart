import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:file_picker/file_picker.dart';
import 'package:path/path.dart' as p;
import '../../bloc/vault_bloc.dart';
import '../../bloc/editor_bloc.dart';

/// Sidebar widget for vault navigation and file browsing.
/// 
/// Features:
/// - Vault folder selection
/// - Recursive file tree display
/// - File filtering (.md, .txt)
/// - Search/filter capability
class Sidebar extends StatefulWidget {
  const Sidebar({Key? key}) : super(key: key);

  @override
  State<Sidebar> createState() => _SidebarState();
}

class _SidebarState extends State<Sidebar> {
  final TextEditingController _searchController = TextEditingController();
  bool _showSearch = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF1E1E1E),
      child: Column(
        children: [
          // Header with title
          _buildHeader(context),
          
          // Divider
          Container(
            height: 1,
            color: const Color(0xFF404040),
          ),
          
          // Action buttons
          _buildActionButtons(context),
          
          // Divider
          Container(
            height: 1,
            color: const Color(0xFF404040),
          ),
          
          // Search box (if shown)
          if (_showSearch) _buildSearchBox(),
          
          // Vault info
          BlocBuilder<VaultBloc, VaultState>(
            builder: (context, state) {
              if (state.currentVault == null) {
                return Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    'No vault selected',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                );
              }
              
              return Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.folder,
                          size: 16,
                          color: Color(0xFF007ACC),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            state.currentVault!.name,
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.white,
                              fontWeight: FontWeight.w500,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        '${state.currentVault!.fileCount} files',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey[600],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          
          // Divider
          Container(
            height: 1,
            color: const Color(0xFF404040),
          ),
          
          // Files list
          Expanded(
            child: BlocBuilder<VaultBloc, VaultState>(
              builder: (context, state) {
                if (state.isLoading) {
                  return const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Color(0xFF0E639C),
                      ),
                    ),
                  );
                }
                
                if (state.currentVault == null || state.currentVault!.fileList.isEmpty) {
                  return Center(
                    child: Text(
                      'No files',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  );
                }
                
                return ListView.builder(
                  itemCount: state.currentVault!.fileList.length,
                  itemBuilder: (context, index) {
                    final file = state.currentVault!.fileList[index];
                    return _buildFileItem(file);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  /// Build sidebar header
  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Text(
        'ACROPAD',
        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.bold,
          color: const Color(0xFF0E639C),
        ),
      ),
    );
  }

  /// Build action buttons
  Widget _buildActionButtons(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: Row(
        children: [
          // Open vault button
          Expanded(
            child: Tooltip(
              message: 'Open Vault',
              child: ElevatedButton.icon(
                onPressed: () {
                  _showVaultPicker(context);
                },
                icon: const Icon(Icons.folder_open, size: 16),
                label: const Text('Vault'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0E639C),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                ),
              ),
            ),
          ),
          
          const SizedBox(width: 4),
          
          // New file button
          Expanded(
            child: Tooltip(
              message: 'New File',
              child: ElevatedButton.icon(
                onPressed: () {
                  _createNewFile(context);
                },
                icon: const Icon(Icons.add, size: 16),
                label: const Text('New'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF007ACC),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                ),
              ),
            ),
          ),
          
          const SizedBox(width: 4),
          
          // Search button
          Tooltip(
            message: 'Search',
            child: IconButton(
              icon: const Icon(Icons.search, size: 18),
              color: Colors.grey[400],
              onPressed: () {
                setState(() {
                  _showSearch = !_showSearch;
                });
              },
            ),
          ),
        ],
      ),
    );
  }

  /// Build search box
  Widget _buildSearchBox() {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: TextField(
        controller: _searchController,
        style: const TextStyle(
          fontSize: 12,
          color: Colors.white,
        ),
        decoration: InputDecoration(
          hintText: 'Search files...',
          hintStyle: TextStyle(color: Colors.grey[600]),
          prefixIcon: const Icon(Icons.search, size: 16),
          contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(4),
            borderSide: const BorderSide(color: Color(0xFF404040)),
          ),
          filled: true,
          fillColor: const Color(0xFF252526),
        ),
      ),
    );
  }

  /// Build individual file item
  Widget _buildFileItem(String filePath) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(4),
          ),
          child: ListTile(
            dense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            leading: const Icon(Icons.description, size: 16, color: Color(0xFF007ACC)),
            title: Text(
              filePath.split('/').last,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.white,
              ),
              overflow: TextOverflow.ellipsis,
            ),
            hoverColor: const Color(0xFF2D2D30),
            onTap: () {
              final fileName = p.basename(filePath);
              final extension = p.extension(filePath);
              context.read<EditorBloc>().add(OpenFileEvent(
                filePath: filePath,
                fileName: fileName,
                fileExtension: extension,
              ));
            },
          ),
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

  void _createNewFile(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('New File'),
        content: TextField(
          decoration: const InputDecoration(hintText: 'File name'),
          onSubmitted: (fileName) {
            if (fileName.isNotEmpty) {
              if (context.mounted) {
                context.read<VaultBloc>().add(CreateFileEvent(fileName));
              }
              Navigator.pop(context);
            }
          },
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        ],
      ),
    );
  }
}

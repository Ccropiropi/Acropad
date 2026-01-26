import 'package:equatable/equatable.dart';

/// Represents a Vault (workspace/folder) in Acropad.
/// 
/// A vault contains all markdown and text files for a project.
class VaultModel extends Equatable {
  /// Display name of the vault
  final String name;
  
  /// Full path to the vault on disk
  final String path;
  
  /// List of file paths relative to the vault root
  final List<String> fileList;
  
  /// Count of total files in the vault
  final int fileCount;

  const VaultModel({
    required this.name,
    required this.path,
    this.fileList = const [],
    this.fileCount = 0,
  });

  /// Create a copy of this VaultModel with optional parameter overrides
  VaultModel copyWith({
    String? name,
    String? path,
    List<String>? fileList,
    int? fileCount,
  }) {
    return VaultModel(
      name: name ?? this.name,
      path: path ?? this.path,
      fileList: fileList ?? this.fileList,
      fileCount: fileCount ?? this.fileCount,
    );
  }

  @override
  List<Object?> get props => [name, path, fileList, fileCount];
}

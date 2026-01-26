import 'package:equatable/equatable.dart';

/// Represents a file in the vault (document model).
/// 
/// This model contains metadata about a file and is used
/// throughout the application for state management.
class FileModel extends Equatable {
  /// Unique identifier for the file
  final String id;
  
  /// Display name of the file (filename without full path)
  final String name;
  
  /// Full path to the file on disk
  final String path;
  
  /// File extension (.md, .txt, etc.)
  final String extension;
  
  /// Current content of the file
  final String content;
  
  /// Indicates if the file has unsaved changes
  final bool isModified;
  
  /// Last modified timestamp
  final DateTime? lastModified;

  const FileModel({
    required this.id,
    required this.name,
    required this.path,
    required this.extension,
    this.content = '',
    this.isModified = false,
    this.lastModified,
  });

  /// Create a copy of this FileModel with optional parameter overrides
  FileModel copyWith({
    String? id,
    String? name,
    String? path,
    String? extension,
    String? content,
    bool? isModified,
    DateTime? lastModified,
  }) {
    return FileModel(
      id: id ?? this.id,
      name: name ?? this.name,
      path: path ?? this.path,
      extension: extension ?? this.extension,
      content: content ?? this.content,
      isModified: isModified ?? this.isModified,
      lastModified: lastModified ?? this.lastModified,
    );
  }

  @override
  List<Object?> get props => [
    id,
    name,
    path,
    extension,
    content,
    isModified,
    lastModified,
  ];
}

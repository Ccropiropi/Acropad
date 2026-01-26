part of 'editor_bloc.dart';

/// State for Editor management
class EditorState extends Equatable {
  /// Currently opened file
  final FileModel? currentFile;
  
  /// Loading indicator
  final bool isLoading;
  
  /// Saving indicator
  final bool isSaving;
  
  /// Error message if any
  final String error;
  
  /// Show unsaved changes warning
  final bool showUnsavedWarning;

  const EditorState({
    this.currentFile,
    this.isLoading = false,
    this.isSaving = false,
    this.error = '',
    this.showUnsavedWarning = false,
  });

  /// Create a copy with optional overrides
  EditorState copyWith({
    FileModel? currentFile,
    bool? isLoading,
    bool? isSaving,
    String? error,
    bool? showUnsavedWarning,
  }) {
    return EditorState(
      currentFile: currentFile ?? this.currentFile,
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      error: error ?? this.error,
      showUnsavedWarning: showUnsavedWarning ?? this.showUnsavedWarning,
    );
  }

  @override
  List<Object?> get props => [
    currentFile,
    isLoading,
    isSaving,
    error,
    showUnsavedWarning,
  ];
}

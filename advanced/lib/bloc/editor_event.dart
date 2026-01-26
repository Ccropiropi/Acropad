part of 'editor_bloc.dart';

/// Base class for all Editor events
abstract class EditorEvent extends Equatable {
  const EditorEvent();
}

/// Event to open a file
class OpenFileEvent extends EditorEvent {
  final String filePath;
  final String fileName;
  final String fileExtension;

  const OpenFileEvent({
    required this.filePath,
    required this.fileName,
    required this.fileExtension,
  });

  @override
  List<Object?> get props => [filePath, fileName, fileExtension];
}

/// Event to update file content
class UpdateFileContentEvent extends EditorEvent {
  final String newContent;

  const UpdateFileContentEvent(this.newContent);

  @override
  List<Object?> get props => [newContent];
}

/// Event to save the current file
class SaveFileEvent extends EditorEvent {
  const SaveFileEvent();

  @override
  List<Object?> get props => [];
}

/// Event to close the current file
class CloseFileEvent extends EditorEvent {
  const CloseFileEvent();

  @override
  List<Object?> get props => [];
}

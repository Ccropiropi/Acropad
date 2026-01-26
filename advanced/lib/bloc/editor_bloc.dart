import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import '../models/file_model.dart';
import '../services/native_bridge.dart';

part 'editor_event.dart';
part 'editor_state.dart';

/// BLoC for managing editor state.
/// 
/// Handles:
/// - Opening/closing files
/// - Content modifications
/// - File switching with unsaved changes detection
/// - Auto-save coordination
class EditorBloc extends Bloc<EditorEvent, EditorState> {
  EditorBloc() : super(const EditorState()) {
    on<OpenFileEvent>(_onOpenFile);
    on<UpdateFileContentEvent>(_onUpdateFileContent);
    on<SaveFileEvent>(_onSaveFile);
    on<CloseFileEvent>(_onCloseFile);
  }

  Future<void> _onOpenFile(
    OpenFileEvent event,
    Emitter<EditorState> emit,
  ) async {
    emit(state.copyWith(isLoading: true));
    
    try {
      final content = await NativeBridge.readFile(event.filePath);
      
      final file = FileModel(
        id: event.filePath,
        name: event.fileName,
        path: event.filePath,
        extension: event.fileExtension,
        content: content,
      );
      
      emit(state.copyWith(
        currentFile: file,
        isLoading: false,
        error: '',
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        error: 'Failed to open file: ${e.toString()}',
      ));
    }
  }

  Future<void> _onUpdateFileContent(
    UpdateFileContentEvent event,
    Emitter<EditorState> emit,
  ) async {
    if (state.currentFile == null) return;
    
    final updatedFile = state.currentFile!.copyWith(
      content: event.newContent,
      isModified: true,
    );
    
    emit(state.copyWith(currentFile: updatedFile));
  }

  Future<void> _onSaveFile(
    SaveFileEvent event,
    Emitter<EditorState> emit,
  ) async {
    if (state.currentFile == null) return;
    
    emit(state.copyWith(isSaving: true));
    
    try {
      await NativeBridge.writeFile(
        state.currentFile!.path,
        state.currentFile!.content,
      );
      
      final savedFile = state.currentFile!.copyWith(
        isModified: false,
        lastModified: DateTime.now(),
      );
      
      emit(state.copyWith(
        currentFile: savedFile,
        isSaving: false,
        error: '',
      ));
    } catch (e) {
      emit(state.copyWith(
        isSaving: false,
        error: 'Failed to save file: ${e.toString()}',
      ));
    }
  }

  Future<void> _onCloseFile(
    CloseFileEvent event,
    Emitter<EditorState> emit,
  ) async {
    if (state.currentFile?.isModified ?? false) {
      emit(state.copyWith(showUnsavedWarning: true));
    } else {
      emit(state.copyWith(currentFile: null));
    }
  }
}

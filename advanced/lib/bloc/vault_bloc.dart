import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import '../models/vault_model.dart';
import '../services/native_bridge.dart';

part 'vault_event.dart';
part 'vault_state.dart';

/// BLoC for managing vault (workspace) state.
/// 
/// Handles:
/// - Opening/closing vaults
/// - Loading file lists
/// - Managing vault navigation
class VaultBloc extends Bloc<VaultEvent, VaultState> {
  VaultBloc() : super(const VaultState()) {
    on<OpenVaultEvent>(_onOpenVault);
    on<CloseVaultEvent>(_onCloseVault);
    on<RefreshVaultEvent>(_onRefreshVault);
    on<CreateFileEvent>(_onCreateFile);
  }

  Future<void> _onOpenVault(
    OpenVaultEvent event,
    Emitter<VaultState> emit,
  ) async {
    emit(state.copyWith(isLoading: true));
    
    try {
      final fileList = await NativeBridge.scanDirectory(event.vaultPath);
      
      final vault = VaultModel(
        name: event.vaultName,
        path: event.vaultPath,
        fileList: fileList,
        fileCount: fileList.length,
      );
      
      emit(state.copyWith(
        currentVault: vault,
        isLoading: false,
        error: '',
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        error: 'Failed to open vault: ${e.toString()}',
      ));
    }
  }

  Future<void> _onCloseVault(
    CloseVaultEvent event,
    Emitter<VaultState> emit,
  ) async {
    emit(state.copyWith(currentVault: null));
  }

  Future<void> _onRefreshVault(
    RefreshVaultEvent event,
    Emitter<VaultState> emit,
  ) async {
    if (state.currentVault == null) return;
    
    emit(state.copyWith(isLoading: true));
    
    try {
      final fileList = await NativeBridge.scanDirectory(state.currentVault!.path);
      
      final updatedVault = state.currentVault!.copyWith(
        fileList: fileList,
        fileCount: fileList.length,
      );
      
      emit(state.copyWith(
        currentVault: updatedVault,
        isLoading: false,
        error: '',
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        error: 'Failed to refresh vault: ${e.toString()}',
      ));
    }
  }

  Future<void> _onCreateFile(
    CreateFileEvent event,
    Emitter<VaultState> emit,
  ) async {
    if (state.currentVault == null) return;
    
    try {
      // In a real app, this would call Rust to create the file
      // For now, we simulate it via NativeBridge if we had a createFile method,
      // but we'll just refresh for now as a placeholder.
      add(const RefreshVaultEvent());
    } catch (e) {
      emit(state.copyWith(error: 'Failed to create file: ${e.toString()}'));
    }
  }
}

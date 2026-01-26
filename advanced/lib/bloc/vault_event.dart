part of 'vault_bloc.dart';

/// Base class for all Vault events
abstract class VaultEvent extends Equatable {
  const VaultEvent();
}

/// Fired when user opens a vault
class OpenVaultEvent extends VaultEvent {
  final String vaultPath;
  final String vaultName;

  const OpenVaultEvent({
    required this.vaultPath,
    required this.vaultName,
  });

  @override
  List<Object?> get props => [vaultPath, vaultName];
}

/// Fired when user closes the current vault
class CloseVaultEvent extends VaultEvent {
  const CloseVaultEvent();

  @override
  List<Object?> get props => [];
}

/// Fired to refresh the vault file list
class RefreshVaultEvent extends VaultEvent {
  const RefreshVaultEvent();

  @override
  List<Object?> get props => [];
}

/// Fired to create a new file in the vault
class CreateFileEvent extends VaultEvent {
  final String fileName;

  const CreateFileEvent(this.fileName);

  @override
  List<Object?> get props => [fileName];
}

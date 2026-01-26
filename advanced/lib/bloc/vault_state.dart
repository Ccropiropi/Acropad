part of 'vault_bloc.dart';

/// State for Vault management
class VaultState extends Equatable {
  /// Currently opened vault
  final VaultModel? currentVault;
  
  /// Loading indicator
  final bool isLoading;
  
  /// Error message if any
  final String error;

  const VaultState({
    this.currentVault,
    this.isLoading = false,
    this.error = '',
  });

  /// Create a copy with optional overrides
  VaultState copyWith({
    VaultModel? currentVault,
    bool? isLoading,
    String? error,
  }) {
    return VaultState(
      currentVault: currentVault ?? this.currentVault,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [currentVault, isLoading, error];
}

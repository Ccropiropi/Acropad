import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'src/rust/frb_generated.dart';
import 'bloc/editor_bloc.dart';
import 'bloc/vault_bloc.dart';
import 'ui/screens/main_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await RustLib.init();
  runApp(const AcropadApp());
}

/// Main entry point for the Acropad application.
/// 
/// Sets up BLoC providers and configures the global theme.
class AcropadApp extends StatelessWidget {
  const AcropadApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => VaultBloc()),
        BlocProvider(create: (context) => EditorBloc()),
      ],
      child: MaterialApp(
        title: 'Acropad',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF1E1E1E),
          primaryColor: const Color(0xFF0E639C),
          textTheme: GoogleFonts.sourceCodeProTextTheme(
            Theme.of(context).textTheme,
          ),
          colorScheme: ColorScheme.dark(
            primary: const Color(0xFF0E639C),
            secondary: const Color(0xFF007ACC),
            surface: const Color(0xFF252526),
            background: const Color(0xFF1E1E1E),
          ),
        ),
        home: const MainScreen(),
      ),
    );
  }
}
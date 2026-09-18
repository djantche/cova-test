import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:taskmanager_mobile/main.dart';

void main() {
  testWidgets('App shows the login screen when logged out', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const TaskManagerApp());
    await tester.pumpAndSettle();

    expect(find.text('Task Manager'), findsOneWidget);
    expect(find.text('Se connecter'), findsOneWidget);
  });
}

import 'api_client.dart';

class AuthResult {
  final String token;
  final String name;
  final String email;

  AuthResult({required this.token, required this.name, required this.email});

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    return AuthResult(
      token: json['token'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
    );
  }
}

class AuthService {
  static Future<AuthResult> register(String name, String email, String password) async {
    final json = await ApiClient.post(
      '/api/auth/register',
      {'name': name, 'email': email, 'password': password},
      auth: false,
    );
    final result = AuthResult.fromJson(json);
    await ApiClient.saveToken(result.token);
    return result;
  }

  static Future<AuthResult> login(String email, String password) async {
    final json = await ApiClient.post(
      '/api/auth/login',
      {'email': email, 'password': password},
      auth: false,
    );
    final result = AuthResult.fromJson(json);
    await ApiClient.saveToken(result.token);
    return result;
  }

  static Future<void> logout() => ApiClient.clearToken();

  static Future<bool> isLoggedIn() async {
    final token = await ApiClient.getToken();
    return token != null;
  }
}

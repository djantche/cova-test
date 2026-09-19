import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);

  @override
  String toString() => message;
}

class ApiClient {
  static const String _rawBaseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'https://cova-test.onrender.com',
  );

  /// Strips a trailing slash so `$baseUrl$path` never produces `//api/...`
  /// regardless of how API_URL was passed in via --dart-define.
  static String get baseUrl =>
      _rawBaseUrl.endsWith('/') ? _rawBaseUrl.substring(0, _rawBaseUrl.length - 1) : _rawBaseUrl;

  static const _tokenKey = 'taskmanager_token';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  static Future<Map<String, String>> _headers({bool auth = false}) async {
    final headers = {'Content-Type': 'application/json'};
    if (auth) {
      final token = await getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  static dynamic _handle(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    }
    String message = 'Une erreur est survenue';
    try {
      final body = jsonDecode(response.body);
      message = body['message'] ?? message;
    } catch (_) {}
    throw ApiException(response.statusCode, message);
  }

  // Render's free plan spins the backend down after inactivity; the first
  // request after a cold start can take ~30-50s to wake it back up.
  static const _timeout = Duration(seconds: 60);

  static Future<dynamic> get(String path, {bool auth = true}) async {
    final response = await http
        .get(Uri.parse('$baseUrl$path'), headers: await _headers(auth: auth))
        .timeout(_timeout);
    return _handle(response);
  }

  static Future<dynamic> post(String path, Map<String, dynamic> body, {bool auth = true}) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl$path'),
          headers: await _headers(auth: auth),
          body: jsonEncode(body),
        )
        .timeout(_timeout);
    return _handle(response);
  }

  static Future<dynamic> put(String path, Map<String, dynamic> body, {bool auth = true}) async {
    final response = await http
        .put(
          Uri.parse('$baseUrl$path'),
          headers: await _headers(auth: auth),
          body: jsonEncode(body),
        )
        .timeout(_timeout);
    return _handle(response);
  }

  static Future<void> delete(String path, {bool auth = true}) async {
    final response = await http
        .delete(Uri.parse('$baseUrl$path'), headers: await _headers(auth: auth))
        .timeout(_timeout);
    _handle(response);
  }
}

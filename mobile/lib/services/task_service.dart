import '../models/task.dart';
import 'api_client.dart';

class TaskService {
  static Future<List<Task>> fetchTasks({TaskStatus? status, String? search}) async {
    final params = <String, String>{};
    if (status != null) params['status'] = status.name;
    if (search != null && search.isNotEmpty) params['search'] = search;
    final query = params.isEmpty ? '' : '?${Uri(queryParameters: params).query}';
    final json = await ApiClient.get('/api/tasks$query');
    return (json as List).map((e) => Task.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<Task> createTask(String title, String description, TaskStatus status) async {
    final json = await ApiClient.post('/api/tasks', {
      'title': title,
      'description': description,
      'status': status.name,
    });
    return Task.fromJson(json as Map<String, dynamic>);
  }

  static Future<Task> updateTask(int id, String title, String description, TaskStatus status) async {
    final json = await ApiClient.put('/api/tasks/$id', {
      'title': title,
      'description': description,
      'status': status.name,
    });
    return Task.fromJson(json as Map<String, dynamic>);
  }

  static Future<void> deleteTask(int id) => ApiClient.delete('/api/tasks/$id');
}

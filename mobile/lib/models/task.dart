// ignore_for_file: constant_identifier_names
// Names match the backend's TaskStatus enum values exactly for JSON (de)serialization.
enum TaskStatus { TODO, IN_PROGRESS, DONE }

TaskStatus taskStatusFromString(String value) {
  return TaskStatus.values.firstWhere((e) => e.name == value, orElse: () => TaskStatus.TODO);
}

String taskStatusLabel(TaskStatus status) {
  switch (status) {
    case TaskStatus.TODO:
      return 'À faire';
    case TaskStatus.IN_PROGRESS:
      return 'En cours';
    case TaskStatus.DONE:
      return 'Terminée';
  }
}

class Task {
  final int id;
  final String title;
  final String? description;
  final TaskStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  Task({
    required this.id,
    required this.title,
    this.description,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String?,
      status: taskStatusFromString(json['status'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }
}

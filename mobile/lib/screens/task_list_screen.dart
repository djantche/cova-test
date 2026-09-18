import 'package:flutter/material.dart';
import '../models/task.dart';
import '../services/task_service.dart';
import '../services/auth_service.dart';
import '../services/api_client.dart';
import 'login_screen.dart';

class TaskListScreen extends StatefulWidget {
  const TaskListScreen({super.key});

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen> {
  List<Task> _tasks = [];
  bool _loading = true;
  String? _error;
  TaskStatus? _statusFilter;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final tasks = await TaskService.fetchTasks(
        status: _statusFilter,
        search: _searchController.text.trim(),
      );
      setState(() => _tasks = tasks);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'Impossible de charger les tâches');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  void _openTaskForm({Task? task}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => _TaskFormSheet(
        task: task,
        onSaved: _loadTasks,
      ),
    );
  }

  Future<void> _deleteTask(Task task) async {
    try {
      await TaskService.deleteTask(task.id);
      _loadTasks();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur lors de la suppression')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Task Manager'),
        actions: [
          IconButton(icon: const Icon(Icons.logout), onPressed: _logout),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    labelText: 'Rechercher une tâche',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                  ),
                  onSubmitted: (_) => _loadTasks(),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<TaskStatus?>(
                        initialValue: _statusFilter,
                        decoration: const InputDecoration(
                          labelText: 'Statut',
                          border: OutlineInputBorder(),
                        ),
                        items: [
                          const DropdownMenuItem(value: null, child: Text('Tous les statuts')),
                          ...TaskStatus.values.map(
                            (s) => DropdownMenuItem(value: s, child: Text(taskStatusLabel(s))),
                          ),
                        ],
                        onChanged: (value) {
                          setState(() => _statusFilter = value);
                          _loadTasks();
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(onPressed: _loadTasks, child: const Text('Filtrer')),
                  ],
                ),
              ],
            ),
          ),
          if (_error != null) Padding(padding: const EdgeInsets.all(8), child: Text(_error!, style: const TextStyle(color: Colors.red))),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _tasks.isEmpty
                    ? const Center(child: Text('Aucune tâche pour le moment.'))
                    : RefreshIndicator(
                        onRefresh: _loadTasks,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          itemCount: _tasks.length,
                          itemBuilder: (context, index) {
                            final task = _tasks[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 8),
                              child: ListTile(
                                title: Text(task.title),
                                subtitle: Text(task.description?.isNotEmpty == true
                                    ? task.description!
                                    : taskStatusLabel(task.status)),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Chip(label: Text(taskStatusLabel(task.status))),
                                    IconButton(
                                      icon: const Icon(Icons.edit),
                                      onPressed: () => _openTaskForm(task: task),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete, color: Colors.red),
                                      onPressed: () => _deleteTask(task),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _openTaskForm(),
        child: const Icon(Icons.add),
      ),
    );
  }
}

class _TaskFormSheet extends StatefulWidget {
  final Task? task;
  final VoidCallback onSaved;

  const _TaskFormSheet({this.task, required this.onSaved});

  @override
  State<_TaskFormSheet> createState() => _TaskFormSheetState();
}

class _TaskFormSheetState extends State<_TaskFormSheet> {
  late final TextEditingController _titleController;
  late final TextEditingController _descriptionController;
  late TaskStatus _status;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.task?.title ?? '');
    _descriptionController = TextEditingController(text: widget.task?.description ?? '');
    _status = widget.task?.status ?? TaskStatus.TODO;
  }

  Future<void> _submit() async {
    if (_titleController.text.trim().isEmpty) return;
    setState(() => _saving = true);
    try {
      if (widget.task == null) {
        await TaskService.createTask(_titleController.text.trim(), _descriptionController.text.trim(), _status);
      } else {
        await TaskService.updateTask(
          widget.task!.id,
          _titleController.text.trim(),
          _descriptionController.text.trim(),
          _status,
        );
      }
      widget.onSaved();
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors de l\'enregistrement')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(widget.task == null ? 'Nouvelle tâche' : 'Modifier la tâche',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(labelText: 'Titre', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _descriptionController,
            decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()),
            maxLines: 3,
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<TaskStatus>(
            initialValue: _status,
            decoration: const InputDecoration(labelText: 'Statut', border: OutlineInputBorder()),
            items: TaskStatus.values
                .map((s) => DropdownMenuItem(value: s, child: Text(taskStatusLabel(s))))
                .toList(),
            onChanged: (value) => setState(() => _status = value ?? TaskStatus.TODO),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _saving ? null : _submit,
            child: _saving
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : Text(widget.task == null ? 'Ajouter' : 'Enregistrer'),
          ),
        ],
      ),
    );
  }
}

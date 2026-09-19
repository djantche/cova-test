import 'package:flutter/material.dart';

/// Bloc gris animé (effet "shimmer") utilisé pour matérialiser le contenu
/// en cours de chargement, à la place d'un spinner.
class Skeleton extends StatefulWidget {
  final double? width;
  final double height;
  final BorderRadius? borderRadius;

  const Skeleton({
    super.key,
    this.width,
    required this.height,
    this.borderRadius,
  });

  @override
  State<Skeleton> createState() => _SkeletonState();
}

class _SkeletonState extends State<Skeleton> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final base = Theme.of(context).colorScheme.onSurface;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            color: base.withValues(alpha: 0.05 + (_controller.value * 0.06)),
            borderRadius: widget.borderRadius ?? BorderRadius.circular(8),
          ),
        );
      },
    );
  }
}

/// Liste de cartes fantômes reproduisant la structure d'une tâche.
class TaskListSkeleton extends StatelessWidget {
  final int count;

  const TaskListSkeleton({super.key, this.count = 4});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 88),
      itemCount: count,
      physics: const NeverScrollableScrollPhysics(),
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) => const _TaskCardSkeleton(),
    );
  }
}

class _TaskCardSkeleton extends StatelessWidget {
  const _TaskCardSkeleton();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Skeleton(width: 4, height: 40),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Skeleton(width: 160, height: 14),
                  const SizedBox(height: 8),
                  Skeleton(width: MediaQuery.of(context).size.width * 0.5, height: 12),
                  const SizedBox(height: 12),
                  Skeleton(
                    width: 74,
                    height: 18,
                    borderRadius: BorderRadius.circular(20),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            const Skeleton(width: 20, height: 20),
          ],
        ),
      ),
    );
  }
}

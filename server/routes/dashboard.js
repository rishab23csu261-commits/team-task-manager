const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// @route   GET /api/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    let taskFilter = {};
    let projectFilter = {};

    if (req.user.role === 'member') {
      taskFilter.assignedTo = req.user._id;
      projectFilter.members = req.user._id;
    }

    const [totalTasks, completedTasks, inProgressTasks, todoTasks, overdueTasks, totalProjects, recentTasks] =
      await Promise.all([
        Task.countDocuments(taskFilter),
        Task.countDocuments({ ...taskFilter, status: 'completed' }),
        Task.countDocuments({ ...taskFilter, status: 'in-progress' }),
        Task.countDocuments({ ...taskFilter, status: 'todo' }),
        Task.countDocuments({
          ...taskFilter,
          status: { $ne: 'completed' },
          dueDate: { $lt: new Date(), $ne: null },
        }),
        Project.countDocuments(projectFilter),
        Task.find(taskFilter)
          .populate('assignedTo', 'name email')
          .populate('projectId', 'title')
          .sort('-createdAt')
          .limit(5),
      ]);

    res.json({
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        totalProjects,
      },
      tasksByStatus: {
        todo: todoTasks,
        'in-progress': inProgressTasks,
        completed: completedTasks,
      },
      recentTasks,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

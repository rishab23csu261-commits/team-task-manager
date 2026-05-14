const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Admin only
router.post(
  '/',
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('status')
      .optional()
      .isIn(['todo', 'in-progress', 'completed'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { title, description, status, priority, assignedTo, projectId, dueDate } =
        req.body;

      // Verify project exists
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const task = await Task.create({
        title,
        description,
        status,
        priority,
        assignedTo: assignedTo || null,
        projectId,
        dueDate: dueDate || null,
      });

      await task.populate('assignedTo', 'name email');
      await task.populate('projectId', 'title');

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/tasks
// @desc    Get all tasks (admin sees all, member sees assigned)
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, projectId } = req.query;
    let filter = {};

    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (projectId) filter.projectId = projectId;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only view their own tasks
    if (
      req.user.role === 'member' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task (admin: all fields, member: status only)
// @access  Private
router.put('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'member') {
      // Members can only update status of their own tasks
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: 'Not authorized to update this task' });
      }

      // Only allow status update
      if (req.body.status) {
        task.status = req.body.status;
      } else {
        return res
          .status(403)
          .json({ message: 'Members can only update task status' });
      }
    } else {
      // Admin can update all fields
      const { title, description, status, priority, assignedTo, dueDate } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('projectId', 'title');

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Admin only
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

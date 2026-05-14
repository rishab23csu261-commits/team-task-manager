const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/projects
// @desc    Create a new project
// @access  Admin only
router.post(
  '/',
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Project title is required'),
    body('description').optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { title, description, members } = req.body;

      const project = await Project.create({
        title,
        description,
        createdBy: req.user._id,
        members: members || [],
      });

      await project.populate('createdBy', 'name email');
      await project.populate('members', 'name email role');

      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/projects
// @desc    Get all projects (admin sees all, member sees own)
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    let projects;

    if (req.user.role === 'admin') {
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort('-createdAt');
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort('-createdAt');
    }

    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Members can only view projects they belong to
    if (
      req.user.role === 'member' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Admin only
router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const { title, description, members } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, members },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project and its tasks
// @access  Admin only
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete all tasks belonging to this project
    await Task.deleteMany({ projectId: project._id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project and its tasks deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/projects/:id/members
// @desc    Get available users to add as members
// @access  Admin only
router.get('/:id/available-members', authorize('admin'), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const users = await User.find({
      _id: { $nin: [...project.members, project.createdBy] },
    }).select('name email role');

    res.json(users);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

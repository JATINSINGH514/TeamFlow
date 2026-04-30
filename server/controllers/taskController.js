const Task = require('../models/Task.js');
const Project = require('../models/Project.js');

const createTask = async (req, res) => {
  try {
    const { title, description, projectId, priority, deadline } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = new Task({
      title,
      description,
      project: projectId,
      priority,
      deadline,
      createdBy: req.user._id,
    });

    const createdTask = await task.save();

    project.tasks.push(createdTask._id);
    await project.save();

    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignTask = async (req, res) => {
  try {
    const { memberId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project.members.includes(memberId)) {
      return res.status(400).json({ message: 'Cannot assign task. User is not a member of this project.' });
    }

    task.assignedTo = memberId;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo', 'name email').populate('createdBy', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, assignTask, updateTaskStatus, getProjectTasks };

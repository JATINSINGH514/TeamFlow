const Project = require('../models/Project.js');
const User = require('../models/User.js');

const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = new Project({
      title,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });

    const createdProject = await project.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { projects: createdProject._id },
    });

    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).populate('admin', 'name email').populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to add members' });
    }

    if (project.members.includes(memberId)) {
      return res.status(400).json({ message: 'User already a member' });
    }

    project.members.push(memberId);
    await project.save();

    await User.findByIdAndUpdate(memberId, {
      $push: { projects: project._id },
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to remove members' });
    }

    if (project.admin.toString() === memberId.toString()) {
      return res.status(400).json({ message: 'Cannot remove the project admin' });
    }

    project.members = project.members.filter(id => id.toString() !== memberId.toString());
    await project.save();

    await User.findByIdAndUpdate(memberId, {
      $pull: { projects: project._id },
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectAnalytics = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id })
      .populate({
        path: 'tasks',
        populate: {
          path: 'assignedTo',
          select: 'name email'
        }
      });
    
    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;
    let overdueTasks = 0;
    const tasksPerUserMap = {};
    
    const now = new Date();

    projects.forEach(project => {
      project.tasks.forEach(task => {
        totalTasks++;
        if (task.status === 'Done') completedTasks++;
        if (task.status === 'Todo') pendingTasks++;
        if (task.status === 'InProgress') inProgressTasks++;
        if (task.deadline && new Date(task.deadline) < now && task.status !== 'Done') {
          overdueTasks++;
        }
        
        if (task.assignedTo) {
          const userName = task.assignedTo.name;
          tasksPerUserMap[userName] = (tasksPerUserMap[userName] || 0) + 1;
        }
      });
    });
    
    const tasksPerUser = Object.keys(tasksPerUserMap).map(name => ({
      name,
      count: tasksPerUserMap[name]
    }));

    res.json({
      totalProjects: projects.length,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      tasksPerUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getUserProjects, deleteProject, addMember, removeMember, getProjectAnalytics };

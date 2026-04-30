const express = require('express');
const { createTask, assignTask, updateTaskStatus, getProjectTasks } = require('../controllers/taskController.js');
const { protect } = require('../middleware/authMiddleware.js');
const { authorizeRole } = require('../middleware/roleMiddleware.js');

const router = express.Router();

router.route('/')
  .post(protect, authorizeRole('Admin'), createTask);

router.put('/assign/:id', protect, authorizeRole('Admin'), assignTask);
router.put('/status/:id', protect, updateTaskStatus);
router.get('/project/:projectId', protect, getProjectTasks);

module.exports = router;

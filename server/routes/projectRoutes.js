const express = require('express');
const { createProject, getUserProjects, deleteProject, addMember, removeMember, getProjectAnalytics } = require('../controllers/projectController.js');
const { protect } = require('../middleware/authMiddleware.js');
const { authorizeRole } = require('../middleware/roleMiddleware.js');

const router = express.Router();

router.route('/')
  .post(protect, authorizeRole('Admin'), createProject)
  .get(protect, getUserProjects);

router.get('/analytics', protect, getProjectAnalytics);

router.route('/:id')
  .delete(protect, authorizeRole('Admin'), deleteProject);

router.put('/add-member', protect, authorizeRole('Admin'), addMember);
router.put('/remove-member', protect, authorizeRole('Admin'), removeMember);

module.exports = router;

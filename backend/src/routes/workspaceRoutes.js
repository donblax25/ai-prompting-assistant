const express = require('express');
const router = express.Router();
const { getWorkspaces, createWorkspace } = require('../controllers/workspaceController');

router.route('/workspaces')
  .get(getWorkspaces)
  .post(createWorkspace);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getTemplates, createTemplate, getTemplateById } = require('../controllers/templateController');

router.route('/workspaces/:workspaceId/templates')
  .get(getTemplates)
  .post(createTemplate);

router.route('/templates/:templateId')
  .get(getTemplateById);

module.exports = router;

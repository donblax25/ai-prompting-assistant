const express = require('express');
const router = express.Router();
const { scorePrompt, autoFixPrompt, executePrompt, autocompletePrompt } = require('../controllers/promptController');

router.post('/prompts/score', scorePrompt);
router.post('/prompts/auto-fix', autoFixPrompt);
router.post('/prompts/execute', executePrompt);
router.post('/prompts/autocomplete', autocompletePrompt);

module.exports = router;

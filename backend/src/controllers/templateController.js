const prisma = require('../services/db');

// @route   GET /api/v1/workspaces/:workspaceId/templates
exports.getTemplates = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const templates = await prisma.template.findMany({
      where: { workspaceId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    // Parse strings back to JSON for frontend
    const parsedTemplates = templates.map(t => {
       if(t.versions && t.versions.length > 0) {
           t.versions[0].blocks = JSON.parse(t.versions[0].blocks);
           t.versions[0].variables = t.versions[0].variables ? JSON.parse(t.versions[0].variables) : null;
       }
       return t;
    });

    res.json({ success: true, data: parsedTemplates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @route   POST /api/v1/workspaces/:workspaceId/templates
exports.createTemplate = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, isWorkflow, blocks, variables, userId } = req.body;

    const template = await prisma.template.create({
      data: {
        workspaceId,
        name,
        description,
        isWorkflow,
        versions: {
          create: {
            versionNumber: 1,
            blocks: JSON.stringify(blocks),
            variables: variables ? JSON.stringify(variables) : null,
            createdBy: userId
          }
        }
      },
      include: { versions: true }
    });
    
    // Parse it back representing the state directly
    template.versions[0].blocks = JSON.parse(template.versions[0].blocks);
    template.versions[0].variables = template.versions[0].variables ? JSON.parse(template.versions[0].variables) : null;

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @route   GET /api/v1/templates/:templateId
exports.getTemplateById = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    });
    if (!template) return res.status(404).json({ success: false, error: 'Template not found' });
    
    if(template.versions && template.versions.length > 0) {
       template.versions[0].blocks = JSON.parse(template.versions[0].blocks);
       template.versions[0].variables = template.versions[0].variables ? JSON.parse(template.versions[0].variables) : null;
    }

    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

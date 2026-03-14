const prisma = require('../services/db');

// @route   GET /api/v1/workspaces
exports.getWorkspaces = async (req, res) => {
  try {
    // In a real app with auth, we'd filter by req.user.id
    // For MVP, return all workspaces
    const workspaces = await prisma.workspace.findMany();
    res.json({ success: true, data: workspaces });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @route   POST /api/v1/workspaces
exports.createWorkspace = async (req, res) => {
  try {
    const { name, ownerId } = req.body;
    
    // Auto-create user if they don't exist yet for MVP testing
    let user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: ownerId,
          email: `${ownerId}@example.com`,
          name: "Test User"
        }
      });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: user.id,
        members: {
            create: {
                userId: user.id,
                role: 'admin'
            }
        }
      }
    });
    
    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

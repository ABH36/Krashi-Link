const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const { verifyToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

// Public routes
router.get('/', machineController.getMachines);
router.get('/:id', machineController.getMachineById);

// Protected routes (Owner only)
router.post('/', verifyToken, requireRole(['owner']), machineController.createMachine);
router.get('/owner/my-machines', verifyToken, requireRole(['owner']), machineController.getMyMachines);

// 👇 FIXED: Removed 'requireOwnership(Machine)' because Controller handles it now
router.put('/:id', verifyToken, requireRole(['owner']), machineController.updateMachine);
router.delete('/:id', verifyToken, requireRole(['owner']), machineController.deleteMachine);
router.patch('/:id/availability', verifyToken, requireRole(['owner']), machineController.toggleAvailability);

module.exports = router;
const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const { verifyToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');
const upload = require('../middlewares/upload'); // ✅ NEW IMPORT

// Public routes
router.get('/', machineController.getMachines);
router.get('/:id', machineController.getMachineById);

// Protected routes (Owner only)
// ✅ UPDATED: Added 'upload.single' middleware
router.post('/', verifyToken, requireRole(['owner']), upload.single('image'), machineController.createMachine);
router.get('/owner/my-machines', verifyToken, requireRole(['owner']), machineController.getMyMachines);

// ✅ UPDATED: Added 'upload.single' middleware
router.put('/:id', verifyToken, requireRole(['owner']), upload.single('image'), machineController.updateMachine);

router.delete('/:id', verifyToken, requireRole(['owner']), machineController.deleteMachine);
router.patch('/:id/availability', verifyToken, requireRole(['owner']), machineController.toggleAvailability);

module.exports = router;
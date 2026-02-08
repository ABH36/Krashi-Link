const Machine = require('../models/Machine');
const Booking = require('../models/Booking');
const AuditLog = require('../models/AuditLog');
const { ERROR_CODES } = require('../config/constants');

// 1. Create new machine
exports.createMachine = async (req, res) => {
  try {
    console.log('📨 CREATE MACHINE REQUEST:', req.body);
    console.log('📸 FILE:', req.file); // Debug log
    
    // Parse FormData fields (req.body mein Strings aate hain FormData se)
    let { type, name, model, pricing, location, meta, description, rate, unit, addressText } = req.body;

    // ✅ FIX: Construct Pricing Object manually if coming from FormData
    if (!pricing && rate && unit) {
        pricing = { rate: Number(rate), unit: unit };
    }

    // ✅ FIX: Construct Location Object manually if coming from FormData
    if (!location && addressText) {
        location = { addressText: addressText, coordinates: [] }; // Coordinates baad mein add kar sakte hain
    }

    // Handle JSON parsing if they came as strings (FormData limitations)
    if (typeof pricing === 'string') pricing = JSON.parse(pricing);
    if (typeof location === 'string') location = JSON.parse(location);

    if (!type || !name || !pricing) {
      return res.status(400).json({
        success: false,
        error: { code: 'VAL_400', message: 'Missing required fields (Name, Type, Pricing)' }
      });
    }

    // ✅ IMAGE HANDLING
    let imageUrl = '';
    if (req.file) {
        // Create full URL for the uploaded image
        const protocol = req.protocol;
        const host = req.get('host');
        imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    const machine = await Machine.create({
      ownerId: req.user.id,
      type,
      name,
      model,
      pricing,
      location,
      description, // Added description support
      // Store single image in 'image' field (string) or array if your model supports it
      image: imageUrl, 
      images: imageUrl ? [imageUrl] : [], // Backward compatibility
      meta: meta || {}
    });

    const io = req.app.get('io');
    io.emit('machine_added', machine);

    res.status(201).json({
      success: true,
      data: { machineId: machine._id, machine },
      message: 'Machine created successfully'
    });

  } catch (error) {
    console.error('❌ CREATE MACHINE ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get all machines (Filters) -> NO CHANGE
exports.getMachines = async (req, res) => {
  try {
    const { type, availability, lat, lng, radiusKm, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (availability !== undefined) filter.availability = availability === 'true';

    if (lat && lng && radiusKm) {
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radiusKm) * 1000
        }
      };
    }

    const skip = (page - 1) * limit;
    const machines = await Machine.find(filter)
      .populate('ownerId', 'name phone trustScore')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    if (lat && lng) {
      machines.forEach(machine => {
        if (machine.location?.coordinates) {
          const [lng2, lat2] = machine.location.coordinates;
          machine.distanceKm = calculateDistance(parseFloat(lat), parseFloat(lng), lat2, lng2);
        }
      });
      machines.sort((a, b) => (a.distanceKm || Infinity) - (b.distanceKm || Infinity));
    }

    const total = await Machine.countDocuments(filter);

    res.json({
      success: true,
      data: {
        machines,
        pagination: { page: parseInt(page), limit: parseInt(limit), total }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 3. Get machine by ID -> NO CHANGE
exports.getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id)
      .populate('ownerId', 'name phone trustScore addresses');

    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    res.json({ success: true, data: { machine } });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// 4. Update machine
exports.updateMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    if (machine.ownerId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access Denied' });
    }

    // Extract fields including flat fields from FormData
    const { rate, unit, addressText, ...otherUpdates } = req.body;
    let updates = { ...otherUpdates };

    // Handle Pricing update
    if (rate || unit) {
        updates.pricing = {
            rate: rate ? Number(rate) : machine.pricing.rate,
            unit: unit || machine.pricing.unit
        };
    }

    // Handle Location update
    if (addressText) {
        updates.location = {
            ...machine.location,
            addressText: addressText
        };
    }

    // ✅ HANDLE IMAGE UPDATE
    if (req.file) {
        const protocol = req.protocol;
        const host = req.get('host');
        const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        updates.image = imageUrl;
        updates.images = [imageUrl]; // Keep legacy support
    }

    const allowedUpdates = ['name', 'model', 'pricing', 'location', 'image', 'images', 'meta', 'maintenance', 'availability', 'description', 'type'];

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        machine[key] = updates[key];
      }
    });

    await machine.save();
    res.json({ success: true, data: { machine }, message: 'Updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// 5. Delete machine -> NO CHANGE
exports.deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    if (machine.ownerId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access Denied' });
    }

    const activeBooking = await Booking.findOne({
      machineId: machine._id,
      status: { 
        $in: ['requested', 'owner_confirmed', 'arrived_otp_verified', 'in_progress', 'completed_pending_payment'] 
      }
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BK_STATE_409',
          message: `Cannot delete: Active booking exists (${activeBooking.status}).`
        }
      });
    }

    await Machine.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    io.emit('machine_deleted', machine._id);

    res.json({ success: true, data: { deleted: true }, message: 'Machine deleted successfully' });

  } catch (error) {
    console.error('Delete machine error:', error);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

// 6. Toggle Availability -> NO CHANGE
exports.toggleAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ success: false });

    if (machine.ownerId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false });
    }

    machine.availability = availability;
    await machine.save();

    res.json({ success: true, data: { availability: machine.availability } });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// 7. Get Owner's Machines -> NO CHANGE
exports.getMyMachines = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const skip = (page - 1) * limit;

    const machines = await Machine.find({ ownerId: req.user.id })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Machine.countDocuments({ ownerId: req.user.id });

    res.json({
      success: true,
      data: {
        machines,
        pagination: { page: parseInt(page), limit: parseInt(limit), total }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// Helper: Calculate Distance -> NO CHANGE
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 100) / 100;
}
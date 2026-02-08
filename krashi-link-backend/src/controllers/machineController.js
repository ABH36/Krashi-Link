const Machine = require('../models/Machine');
const Booking = require('../models/Booking');
const AuditLog = require('../models/AuditLog');
const { ERROR_CODES } = require('../config/constants');

// 1. Create new machine (FIXED: Handles FormData & Validation Errors)
exports.createMachine = async (req, res) => {
  try {
    console.log('📨 CREATE MACHINE REQUEST:', req.body);
    
    // FormData se alag-alag fields nikalo (Raw Data)
    let { 
        type, name, model, description,
        rate, unit, scheme,             // Pricing Fields
        addressText, lat, lng,          // Location Fields
        condition, fuelType, year,      // Meta Fields
        meta, pricing, location         // JSON Strings (agar frontend JSON bheje)
    } = req.body;

    // --- ✅ STEP 1: Construct Pricing Object ---
    let pricingObj = {};
    if (pricing && typeof pricing === 'string') {
        pricingObj = JSON.parse(pricing);
    } else {
        // Validation Fix: Default 'scheme' to 'time' (hour) if missing
        pricingObj = { 
            rate: rate ? Number(rate) : 0, 
            unit: unit || 'hour', 
            scheme: scheme || 'time' 
        };
    }

    // --- ✅ STEP 2: Construct Location Object ---
    let locationObj = {};
    if (location && typeof location === 'string') {
        locationObj = JSON.parse(location);
    } else {
        // Validation Fix: Default lat/lng to 0 if missing (To bypass Mongoose validation)
        const latitude = lat ? Number(lat) : 0;
        const longitude = lng ? Number(lng) : 0;
        
        locationObj = { 
            addressText: addressText || '',
            lat: latitude,
            lng: longitude,
            coordinates: [longitude, latitude] // GeoJSON format [lng, lat]
        };
    }

    // --- ✅ STEP 3: Construct Meta Object ---
    let metaObj = {};
    if (meta && typeof meta === 'string') {
        try { metaObj = JSON.parse(meta); } catch(e) { metaObj = {}; }
    } else {
        metaObj = {
            condition: condition || 'good',
            fuelType: fuelType || 'diesel',
            year: year
        };
    }

    // Validation Check
    if (!type || !name || !pricingObj.rate) {
      return res.status(400).json({
        success: false,
        error: { code: 'VAL_400', message: 'Missing required fields (Name, Type, Rate)' }
      });
    }

    // --- ✅ STEP 4: Image Handling ---
    let imageUrl = '';
    if (req.file) {
        const protocol = req.protocol;
        const host = req.get('host');
        imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    // Create Machine
    const machine = await Machine.create({
      ownerId: req.user.id,
      type,
      name,
      model,
      description,
      pricing: pricingObj,   // ✅ Fixed Object
      location: locationObj, // ✅ Fixed Object
      image: imageUrl, 
      images: imageUrl ? [imageUrl] : [],
      meta: metaObj          // ✅ Fixed Object
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
    res.status(500).json({ 
        success: false, 
        message: error.message || 'Machine creation failed',
        error: error.errors // Details for debugging
    });
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

// 4. Update machine (FIXED: Handles FormData Partial Updates)
exports.updateMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    if (machine.ownerId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access Denied' });
    }

    // Extract FormData fields
    const { 
        rate, unit, scheme, 
        addressText, lat, lng, 
        condition, fuelType, year,
        ...otherUpdates 
    } = req.body;
    
    let updates = { ...otherUpdates };

    // ✅ Handle Pricing Update
    if (rate || unit || scheme) {
        updates.pricing = {
            rate: rate ? Number(rate) : machine.pricing.rate,
            unit: unit || machine.pricing.unit,
            scheme: scheme || machine.pricing.scheme // Preserve existing scheme if not provided
        };
    }

    // ✅ Handle Location Update
    if (addressText || lat || lng) {
        const newLat = lat ? Number(lat) : machine.location.lat;
        const newLng = lng ? Number(lng) : machine.location.lng;
        
        updates.location = {
            addressText: addressText || machine.location.addressText,
            lat: newLat,
            lng: newLng,
            coordinates: (newLat && newLng) ? [newLng, newLat] : machine.location.coordinates
        };
    }

    // ✅ Handle Meta Update
    if (condition || fuelType || year) {
        updates.meta = {
            ...machine.meta, // Keep existing meta
            condition: condition || machine.meta?.condition,
            fuelType: fuelType || machine.meta?.fuelType,
            year: year || machine.meta?.year
        };
    }

    // ✅ Handle Image Update
    if (req.file) {
        const protocol = req.protocol;
        const host = req.get('host');
        const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        updates.image = imageUrl;
        updates.images = [imageUrl]; 
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

// 5. Delete machine (Existing Logic) -> NO CHANGE
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
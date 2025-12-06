const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['farmer', 'owner', 'admin']
  },
  action: {
    type: String,
    required: true
  },
  entity: {
    type: {
      type: String,
      required: true,
      enum: ['user', 'booking', 'machine', 'transaction']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for efficient queries
auditLogSchema.index({ actorId: 1 });
auditLogSchema.index({ role: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ 'entity.type': 1, 'entity.id': 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
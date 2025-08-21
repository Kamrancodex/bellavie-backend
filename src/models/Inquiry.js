const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  // Basic Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  
  // Event Details
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: [
      'wedding', 'engagement', 'corporate_event', 'private_celebration',
      'bar_mitzvah', 'nonprofits', 'birthday_party', 'anniversary', 'other'
    ]
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  guestCount: {
    type: Number,
    required: [true, 'Guest count is required'],
    min: [1, 'Guest count must be at least 1']
  },
  
  // Additional Information
  message: {
    type: String,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  budgetRange: {
    min: {
      type: Number,
      min: [0, 'Minimum budget cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum budget cannot be negative']
    }
  },
  
  // Preferred Contact Information
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'text', 'any'],
    default: 'email'
  },
  bestTimeToContact: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'any'],
    default: 'any'
  },
  
  // Services Interested In
  servicesInterested: [{
    type: String,
    enum: [
      'catering', 'venue_rental', 'audio_visual', 'decoration', 
      'entertainment', 'photography', 'transportation', 'full_service'
    ]
  }],
  
  // Venue Preferences
  venuePreferences: {
    indoorOutdoor: {
      type: String,
      enum: ['indoor', 'outdoor', 'both', 'no_preference']
    },
    location: {
      type: String,
      maxlength: [100, 'Location preference cannot exceed 100 characters']
    },
    accessibility: {
      type: Boolean,
      default: false
    }
  },
  
  // Dietary Requirements
  dietaryRequirements: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_allergy', 'kosher', 'halal', 'other']
  }],
  specialRequests: {
    type: String,
    maxlength: [1000, 'Special requests cannot exceed 1000 characters']
  },
  
  // Lead Information
  leadSource: {
    type: String,
    enum: [
      'website', 'referral', 'social_media', 'google_ads', 
      'facebook_ads', 'email_campaign', 'phone_call', 
      'walk_in', 'event', 'other'
    ],
    default: 'website'
  },
  referredBy: {
    type: String,
    trim: true,
    maxlength: [100, 'Referred by cannot exceed 100 characters']
  },
  
  // Status and Assignment
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'lost', 'spam'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Follow-up Information
  lastContactDate: {
    type: Date
  },
  nextFollowUpDate: {
    type: Date
  },
  followUpCount: {
    type: Number,
    default: 0,
    min: [0, 'Follow-up count cannot be negative']
  },
  
  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'meeting', 'text', 'note'],
      required: true
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true
    },
    subject: {
      type: String,
      required: true,
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    content: {
      type: String,
      maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Conversion Information
  convertedToClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  convertedToEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  conversionDate: {
    type: Date
  },
  
  // Marketing Consent
  marketingConsent: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    phone: {
      type: Boolean,
      default: true
    }
  },
  
  // Additional Data (for form extensions)
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // System Fields
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  source: {
    page: String,
    utm: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String
    }
  },
  
  // Internal Notes
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // System Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days since inquiry
inquirySchema.virtual('daysSinceInquiry').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now - created;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for days until event
inquirySchema.virtual('daysUntilEvent').get(function() {
  if (!this.eventDate) return null;
  
  const now = new Date();
  const eventDate = new Date(this.eventDate);
  const diffTime = eventDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Indexes for better query performance
inquirySchema.index({ email: 1 });
inquirySchema.index({ phone: 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ eventType: 1 });
inquirySchema.index({ eventDate: 1 });
inquirySchema.index({ assignedTo: 1 });
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ leadSource: 1 });
inquirySchema.index({ priority: 1 });
inquirySchema.index({ nextFollowUpDate: 1 });

// Text search index
inquirySchema.index({
  fullName: 'text',
  email: 'text',
  message: 'text',
  notes: 'text'
});

// Methods
inquirySchema.methods.addCommunication = function(communicationData) {
  this.communications.push(communicationData);
  this.lastContactDate = new Date();
  this.followUpCount += 1;
  return this.save();
};

inquirySchema.methods.convertToClient = function(clientId) {
  this.status = 'converted';
  this.convertedToClient = clientId;
  this.conversionDate = new Date();
  return this.save();
};

inquirySchema.methods.markAsLost = function(reason) {
  this.status = 'lost';
  if (reason) {
    this.notes = this.notes ? `${this.notes}\n\nLost Reason: ${reason}` : `Lost Reason: ${reason}`;
  }
  return this.save();
};

// Static methods
inquirySchema.statics.findNew = function() {
  return this.find({ status: 'new' }).sort({ createdAt: -1 });
};

inquirySchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

inquirySchema.statics.findByAssignedUser = function(userId) {
  return this.find({ assignedTo: userId }).sort({ createdAt: -1 });
};

inquirySchema.statics.findDueForFollowUp = function() {
  return this.find({
    nextFollowUpDate: { $lte: new Date() },
    status: { $nin: ['converted', 'lost', 'spam'] }
  }).sort({ nextFollowUpDate: 1 });
};

inquirySchema.statics.findUpcomingEvents = function(days = 30) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    eventDate: { $gte: startDate, $lte: endDate },
    status: { $nin: ['lost', 'spam'] }
  }).sort({ eventDate: 1 });
};

inquirySchema.statics.getConversionStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Inquiry', inquirySchema);

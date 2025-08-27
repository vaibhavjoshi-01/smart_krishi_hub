const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required'],
    index: true
  },
  
  listingId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  cropType: {
    type: String,
    required: [true, 'Crop type is required'],
    enum: [
      'tomato', 'potato', 'rice', 'corn', 'wheat', 'cotton', 'sugarcane',
      'mango', 'banana', 'apple', 'grapes', 'onion', 'chilli', 'brinjal',
      'paddy', 'maize', 'pulses', 'oilseeds', 'vegetables', 'fruits',
      'dairy', 'poultry', 'fishery', 'other'
    ],
    index: true
  },
  
  variety: {
    type: String,
    trim: true,
    maxlength: [100, 'Variety name cannot exceed 100 characters']
  },
  
  quantity: {
    amount: {
      type: Number,
      required: [true, 'Quantity amount is required'],
      min: [0.1, 'Quantity must be greater than 0']
    },
    unit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      enum: [
        'kg', 'quintal', 'ton', 'dozen', 'piece', 'bundle', 'bag',
        'litre', 'gallon', 'bottle', 'box', 'crate', 'sack'
      ]
    },
    available: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative']
    }
  },
  
  quality: {
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'premium', 'standard', 'economy'],
      default: 'standard'
    },
    certification: [{
      type: String,
      enum: [
        'organic', 'pesticide_free', 'gmo_free', 'fair_trade',
        'rainforest_alliance', 'utz_certified', 'global_gap',
        'india_organic', 'fssai', 'other'
      ]
    }],
    description: {
      type: String,
      maxlength: [500, 'Quality description cannot exceed 500 characters']
    },
    images: [{
      originalName: String,
      filename: String,
      path: String,
      size: Number,
      mimetype: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  pricing: {
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    },
    negotiable: {
      type: Boolean,
      default: true
    },
    bulkDiscount: {
      minQuantity: Number,
      discountPercentage: {
        type: Number,
        min: [0, 'Discount percentage cannot be negative'],
        max: [100, 'Discount percentage cannot exceed 100']
      }
    },
    seasonalPricing: [{
      season: {
        type: String,
        enum: ['spring', 'summer', 'monsoon', 'autumn', 'winter']
      },
      priceMultiplier: {
        type: Number,
        min: [0.1, 'Price multiplier must be greater than 0'],
        max: [10, 'Price multiplier cannot exceed 10']
      }
    }]
  },
  
  harvest: {
    harvestDate: {
      type: Date,
      required: [true, 'Harvest date is required']
    },
    harvestMethod: {
      type: String,
      enum: ['manual', 'mechanical', 'mixed'],
      default: 'manual'
    },
    storageCondition: {
      type: String,
      enum: ['refrigerated', 'room_temperature', 'controlled_atmosphere', 'dried', 'frozen'],
      default: 'room_temperature'
    },
    shelfLife: {
      days: {
        type: Number,
        min: [1, 'Shelf life must be at least 1 day']
      },
      storageNotes: String
    }
  },
  
  location: {
    state: {
      type: String,
      required: [true, 'State is required'],
      index: true
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      index: true
    },
    village: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    deliveryRadius: {
      type: Number,
      min: [0, 'Delivery radius cannot be negative'],
      max: [500, 'Delivery radius cannot exceed 500 km']
    }
  },
  
  logistics: {
    packaging: {
      type: String,
      enum: ['loose', 'packaged', 'bulk', 'custom'],
      default: 'packaged'
    },
    packagingDetails: String,
    weight: {
      gross: Number,
      net: Number,
      unit: {
        type: String,
        enum: ['kg', 'g', 'lb', 'oz'],
        default: 'kg'
      }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'm', 'inch', 'ft'],
        default: 'cm'
      }
    }
  },
  
  status: {
    type: String,
    enum: ['active', 'pending', 'sold_out', 'expired', 'cancelled', 'under_review'],
    default: 'pending',
    index: true
  },
  
  visibility: {
    isPublic: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Number,
      min: [1, 'Priority must be at least 1'],
      max: [10, 'Priority cannot exceed 10'],
      default: 5
    }
  },
  
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    inquiries: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    lastInquiry: Date
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  specialFeatures: [{
    feature: String,
    description: String
  }],
  
  certifications: [{
    name: String,
    issuer: String,
    validUntil: Date,
    certificateNumber: String
  }],
  
  reviews: [{
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: String,
    reviewDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationDate: Date,
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
produceSchema.index({ farmerId: 1, createdAt: -1 });
produceSchema.index({ cropType: 1, status: 1 });
produceSchema.index({ 'location.state': 1, 'location.district': 1 });
produceSchema.index({ 'pricing.pricePerUnit': 1 });
produceSchema.index({ 'harvest.harvestDate': -1 });
produceSchema.index({ status: 1, 'visibility.featured': 1 });
produceSchema.index({ tags: 1 });
produceSchema.index({ isVerified: 1 });

// Pre-save middleware to generate listing ID
produceSchema.pre('save', function(next) {
  if (!this.listingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.listingId = `PL${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Pre-save middleware to update available quantity
produceSchema.pre('save', function(next) {
  if (this.quantity.available > this.quantity.amount) {
    this.quantity.available = this.quantity.amount;
  }
  
  if (this.quantity.available <= 0) {
    this.status = 'sold_out';
  }
  next();
});

// Virtual for average rating
produceSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((totalRating / this.reviews.length) * 10) / 10;
});

// Virtual for total value
produceSchema.virtual('totalValue').get(function() {
  return this.quantity.amount * this.pricing.pricePerUnit;
});

// Virtual for days since harvest
produceSchema.virtual('daysSinceHarvest').get(function() {
  const now = new Date();
  const harvest = new Date(this.harvest.harvestDate);
  const diffTime = Math.abs(now - harvest);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for freshness status
produceSchema.virtual('freshnessStatus').get(function() {
  const daysSinceHarvest = this.daysSinceHarvest;
  const shelfLife = this.harvest.shelfLife?.days || 7;
  
  if (daysSinceHarvest <= shelfLife * 0.25) return 'very_fresh';
  if (daysSinceHarvest <= shelfLife * 0.5) return 'fresh';
  if (daysSinceHarvest <= shelfLife * 0.75) return 'moderate';
  if (daysSinceHarvest <= shelfLife) return 'aging';
  return 'expired';
});

// Instance method to update quantity
produceSchema.methods.updateQuantity = function(newAmount) {
  this.quantity.available = Math.max(0, Math.min(newAmount, this.quantity.amount));
  
  if (this.quantity.available <= 0) {
    this.status = 'sold_out';
  } else if (this.status === 'sold_out') {
    this.status = 'active';
  }
  
  return this.save();
};

// Instance method to add review
produceSchema.methods.addReview = function(reviewerId, rating, comment) {
  this.reviews.push({
    reviewerId,
    rating,
    comment,
    reviewDate: new Date()
  });
  
  // Update analytics
  this.analytics.lastInquiry = new Date();
  
  return this.save();
};

// Instance method to increment views
produceSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

// Instance method to increment inquiries
produceSchema.methods.incrementInquiries = function() {
  this.analytics.inquiries += 1;
  this.analytics.lastInquiry = new Date();
  return this.save();
};

// Static method to find produce by location
produceSchema.statics.findByLocation = function(state, district, radius = 50) {
  const query = {};
  if (state) query['location.state'] = state;
  if (district) query['location.district'] = district;
  
  return this.find({
    ...query,
    status: 'active',
    'visibility.isPublic': true
  });
};

// Static method to find produce by price range
produceSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  const query = {
    status: 'active',
    'visibility.isPublic': true
  };
  
  if (minPrice !== undefined) query['pricing.pricePerUnit'] = { $gte: minPrice };
  if (maxPrice !== undefined) {
    if (query['pricing.pricePerUnit']) {
      query['pricing.pricePerUnit'].$lte = maxPrice;
    } else {
      query['pricing.pricePerUnit'] = { $lte: maxPrice };
    }
  }
  
  return this.find(query);
};

// Static method to find fresh produce
produceSchema.statics.findFreshProduce = function(maxDaysOld = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxDaysOld);
  
  return this.find({
    'harvest.harvestDate': { $gte: cutoffDate },
    status: 'active',
    'visibility.isPublic': true
  });
};

// Static method to get produce statistics
produceSchema.statics.getProduceStats = function() {
  return this.aggregate([
    {
      $match: { status: 'active' }
    },
    {
      $group: {
        _id: {
          crop: '$cropType',
          state: '$location.state'
        },
        totalListings: { $sum: 1 },
        avgPrice: { $avg: '$pricing.pricePerUnit' },
        totalQuantity: { $sum: '$quantity.amount' },
        totalViews: { $sum: '$analytics.views' }
      }
    },
    {
      $sort: { totalListings: -1 }
    }
  ]);
};

// Static method to get trending produce
produceSchema.statics.getTrendingProduce = function(limit = 10) {
  return this.aggregate([
    {
      $match: { 
        status: 'active',
        'visibility.isPublic': true
      }
    },
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $multiply: ['$analytics.views', 1] },
            { $multiply: ['$analytics.inquiries', 5] },
            { $multiply: ['$analytics.shares', 3] }
          ]
        }
      }
    },
    {
      $sort: { engagementScore: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

module.exports = mongoose.model('Produce', produceSchema);

const mongoose = require('mongoose');

const categoryLimitSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  limit: {
    type: Number,
    required: true,
  },
});

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    totalBudget: {
      type: Number,
      required: true,
    },
    categoryLimits: [categoryLimitSchema],
  },
  {
    timestamps: true,
  }
);

// Ensure only one budget per user per month/year
budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);

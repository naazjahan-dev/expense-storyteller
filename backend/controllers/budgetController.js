const asyncHandler = require('express-async-handler');
const supabase = require('../config/supabaseClient');

const createScopedClient = (token) => {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
};

// @desc    Get budget for a specific month and year
// @route   GET /api/budget?month=11&year=2023
// @access  Private
const getBudget = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const token = req.headers.authorization.split(' ')[1];
  const scopedSupabase = createScopedClient(token);

  if (!month || !year) {
    res.status(400);
    throw new Error('Please provide month and year');
  }

  const { data: budget, error } = await scopedSupabase
    .from('budgets')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('month', parseInt(month))
    .eq('year', parseInt(year))
    .single();

  if (error || !budget) {
    return res.status(404).json({ message: 'Budget not found for this period' });
  }

  res.status(200).json(budget);
});

// @desc    Create or update a budget
// @route   POST /api/budget
// @access  Private
const createBudget = asyncHandler(async (req, res) => {
  const { month, year, totalBudget, categoryLimits } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  const scopedSupabase = createScopedClient(token);

  if (!month || !year || !totalBudget) {
    res.status(400);
    throw new Error('Please provide month, year, and totalBudget');
  }

  // Check if a budget already exists
  const { data: existingBudget } = await scopedSupabase
    .from('budgets')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('month', parseInt(month))
    .eq('year', parseInt(year))
    .single();

  if (existingBudget) {
    // Update
    const { data: updatedBudget, error: updateError } = await scopedSupabase
      .from('budgets')
      .update({
        total_budget: totalBudget,
        category_limits: categoryLimits || existingBudget.category_limits
      })
      .eq('id', existingBudget.id)
      .select()
      .single();

    if (updateError) {
      res.status(400);
      throw new Error(updateError.message);
    }
    return res.status(200).json(updatedBudget);
  }

  // Create new
  const { data: newBudget, error: insertError } = await scopedSupabase
    .from('budgets')
    .insert([
      {
        user_id: req.user.id,
        month: parseInt(month),
        year: parseInt(year),
        total_budget: totalBudget,
        category_limits: categoryLimits || []
      }
    ])
    .select()
    .single();

  if (insertError) {
    res.status(400);
    throw new Error(insertError.message);
  }

  res.status(201).json(newBudget);
});

module.exports = {
  getBudget,
  createBudget,
};

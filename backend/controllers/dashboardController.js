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

// @desc    Get dashboard analytics
// @route   GET /api/dashboard
// @access  Private
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const scopedSupabase = createScopedClient(token);

  const { data: transactions, error } = await scopedSupabase
    .from('transactions')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryBreakdown = {};

  if (transactions) {
    transactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpenses += t.amount;
        
        if (categoryBreakdown[t.category]) {
          categoryBreakdown[t.category] += t.amount;
        } else {
          categoryBreakdown[t.category] = t.amount;
        }
      }
    });
  }

  const savings = totalIncome - totalExpenses;

  // Get recent transactions
  const { data: recentTransactions } = await scopedSupabase
    .from('transactions')
    .select('*')
    .eq('user_id', req.user.id)
    .order('date', { ascending: false })
    .limit(5);

  res.status(200).json({
    totalIncome,
    totalExpenses,
    savings,
    categoryBreakdown,
    recentTransactions: recentTransactions || [],
  });
});

module.exports = {
  getDashboardAnalytics,
};

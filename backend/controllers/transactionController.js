const asyncHandler = require('express-async-handler');
const supabase = require('../config/supabaseClient');

// Helper function to create a supabase client for the current user using their JWT
// This ensures Row Level Security (RLS) is applied if enabled
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

// @desc    Get transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const scopedSupabase = createScopedClient(token);

  const { data: transactions, error } = await scopedSupabase
    .from('transactions')
    .select('*')
    .eq('user_id', req.user.id) // Ensure we filter by user id, assuming column name is user_id
    .order('date', { ascending: false });

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  res.status(200).json(transactions);
});

// @desc    Set transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = asyncHandler(async (req, res) => {
  const { title, amount, type, category, date, note, paymentMethod } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  const scopedSupabase = createScopedClient(token);

  if (!title || !amount || !type || !category) {
    res.status(400);
    throw new Error('Please add all required fields (title, amount, type, category)');
  }

  const { data: transaction, error } = await scopedSupabase
    .from('transactions')
    .insert([
      {
        user_id: req.user.id,
        title,
        amount,
        type,
        category,
        date: date || new Date().toISOString(),
        note,
        payment_method: paymentMethod || 'cash',
      }
    ])
    .select()
    .single();

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  res.status(201).json(transaction);
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const scopedSupabase = createScopedClient(token);

  const { data: transaction, error: updateError } = await scopedSupabase
    .from('transactions')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (updateError) {
    res.status(400);
    throw new Error(updateError.message);
  }

  res.status(200).json(transaction);
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const scopedSupabase = createScopedClient(token);

  const { error } = await scopedSupabase
    .from('transactions')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
};

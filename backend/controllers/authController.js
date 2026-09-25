const asyncHandler = require('express-async-handler');
const supabase = require('../config/supabaseClient');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  // Note: Profile creation is handled during first login to respect RLS policies


  res.status(201).json({
    _id: data.user.id,
    username,
    email: data.user.email,
    token: data.session?.access_token,
  });
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please add email and password');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Create scoped client to bypass RLS for profile fetch/insert
  const { createClient } = require('@supabase/supabase-js');
  const scopedClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } }
  });

  // Fetch username from profiles
  const { data: profile } = await scopedClient
    .from('profiles')
    .select('username')
    .eq('id', data.user.id)
    .single();

  let finalUsername = profile?.username;

  // Create profile if it doesn't exist
  if (!profile) {
    finalUsername = data.user.email.split('@')[0];
    await scopedClient.from('profiles').insert([
      { id: data.user.id, username: finalUsername, email: data.user.email }
    ]);
  }

  res.json({
    _id: data.user.id,
    username: finalUsername,
    email: data.user.email,
    token: data.session.access_token,
  });
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  res.status(200).json({
    _id: req.user.id,
    email: req.user.email,
    ...profile
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
};

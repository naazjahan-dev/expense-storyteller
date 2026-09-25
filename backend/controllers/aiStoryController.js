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

// @desc    Get AI Storytelling Insights
// @route   GET /api/insights
// @access  Private
const getStorytellingInsights = asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const scopedSupabase = createScopedClient(token);

  const { data: recentTransactions } = await scopedSupabase
    .from('transactions')
    .select('*')
    .eq('user_id', req.user.id)
    .order('date', { ascending: false })
    .limit(30);

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      message: 'Gemini API key is missing from environment variables.',
      data: null
    });
  }

  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Analyze the following recent transactions and provide 3 distinct, insightful, and concise financial storytelling insights. 
    Format the output as a strict JSON array of objects. Each object must have a 'type' (can be 'success', 'warning', or 'info') and 'text' (the insight string).
    Transactions: ${JSON.stringify(recentTransactions)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const insights = JSON.parse(response.text);

    const formattedInsights = insights.map((insight, index) => ({
      id: index + 1,
      type: insight.type,
      text: insight.text
    }));

    res.status(200).json({
      message: 'Insights generated successfully',
      data: formattedInsights,
      rawDataUsed: recentTransactions ? recentTransactions.length : 0,
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      message: 'Error generating AI insights',
      error: error.message
    });
  }
});

// @desc    Get Full AI Financial Story
// @route   GET /api/insights/story
// @access  Private
const getFullFinancialStory = asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const scopedSupabase = createScopedClient(token);

  // Fetch more transactions for a richer story, e.g., 100
  const { data: transactions } = await scopedSupabase
    .from('transactions')
    .select('*')
    .eq('user_id', req.user.id)
    .order('date', { ascending: false })
    .limit(100);

  if (!transactions || transactions.length < 3) {
    return res.status(200).json({
      message: 'Not enough transactions to generate a meaningful story. Please add more transactions.',
      story: 'You are just beginning your financial journey! Add a few more transactions to uncover your unique financial narrative.'
    });
  }

  let totalIncome = 0;
  let totalExpenses = 0;
  transactions.forEach((t) => {
    if (t.type === 'income') totalIncome += t.amount;
    else if (t.type === 'expense') totalExpenses += t.amount;
  });
  const savings = totalIncome - totalExpenses;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      message: 'Gemini API key is missing from environment variables.',
      story: null
    });
  }

  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an elegant, premium financial AI assistant for "Expense Storyteller". 
    Analyze the user's financial data and write a cohesive, warm, and insightful "Financial Story" (about 2-3 short paragraphs).
    Do not use bullet points. Speak directly to the user in an encouraging tone.
    Total Income: $${totalIncome.toFixed(2)}
    Total Expenses: $${totalExpenses.toFixed(2)}
    Net Savings: $${savings.toFixed(2)}
    Transactions: ${JSON.stringify(transactions)}
    Focus on their spending patterns, highlight any interesting categories, and offer a gentle, positive observation about their habits.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.status(200).json({
      message: 'Story generated successfully',
      story: response.text,
      rawDataUsed: transactions.length,
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      message: 'Error generating AI story',
      error: error.message
    });
  }
});

module.exports = {
  getStorytellingInsights,
  getFullFinancialStory,
};

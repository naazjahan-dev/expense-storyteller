const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budget', require('./routes/budgetRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/insights', require('./routes/aiStoryRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Expense Storyteller API' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

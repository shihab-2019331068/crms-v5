require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const generalRoutes = require('./routes/generalRoutes');
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use('/api', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', generalRoutes);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

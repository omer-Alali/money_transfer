  
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(' Connected to MongoDB Atlas'))
  .catch(err => console.error(' MongoDB connection error:', err));


app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60, 
  }
}));


app.use('/api', authRoutes);


app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});


app.listen(port, () => {
  console.log(` Server is running on http://localhost:${port}`);
});

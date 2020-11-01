const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const requireDir = require('require-dir');

// Iniciando o App
const app = express();
app.use(express.json());
app.use(cors());

// Iniciando o DB
mongoose.connect('mongodb://localhost/login', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

requireDir('./app/models');

// Rotas
app.use(require('./routes'));

app.listen(3333);

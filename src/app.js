const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  const db = mongoose.connection.readyState === 1 ? 'up' : 'down';
  res.status(db === 'up' ? 200 : 503).json({ status: 'ok', db });
});

app.use('/api/books', bookRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Route introuvable' }));

// Gestion centralisée des erreurs
app.use((err, _req, res, _next) => {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: 'Données invalides', errors: Object.values(err.errors).map((e) => e.message) });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON invalide' });
  }
  console.error(err);
  res.status(500).json({ message: 'Erreur serveur' });
});

module.exports = app;

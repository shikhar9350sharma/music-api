
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON (not strictly needed for read-only)
app.use(express.json());
app.use(cors());

// 🔒 Block write operations
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return res.status(403).json({ error: 'Write operations are disabled' });
  }
  next();
});

// 📖 Helper to read db.json
const readDB = (callback) => {
  const filePath = path.join(__dirname, '..', 'db.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return callback(err);
    try {
      const db = JSON.parse(data);
      callback(null, db);
    } catch (parseErr) {
      callback(parseErr);
    }
  });
};

// 🔍 Helper to get item by ID from a section
const getItemById = (section, id, res) => {
  const filePath = path.join(__dirname, '..', 'db.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read database' });

    try {
      const db = JSON.parse(data);
      const item = db[section]?.find(entry => entry.id === parseInt(id));
      if (!item) {
        return res.status(404).json({ error: `${section} item not found` });
      }
      res.json(item);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
};

// 🎯 Custom route for /songs with search support
app.get('/songs', (req, res) => {
  const query = req.query.q?.toLowerCase();
  const filePath = path.join(__dirname, '..', 'db.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read songs' });

    try {
      const db = JSON.parse(data);
      let results = db.songs;

      if (query) {
        results = results.filter(song =>
          song.title?.toLowerCase().includes(query) ||
          song.artist?.toLowerCase().includes(query) ||
          song.album?.toLowerCase().includes(query)
        );
      }

      res.json(results);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

// 📁 Sections to expose
const sections = ['newrelease', 'punjabi', 'english', 'artists', 'albums'];

// 🚀 Generate routes for each section
sections.forEach(section => {
  // Static route: /section
  app.get(`/${section}`, (req, res) => {
    readDB((err, db) => {
      if (err) return res.status(500).json({ error: `Failed to read ${section}` });
      res.json(db[section]);
    });
  });

  // Dynamic route: /section/:id
  app.get(`/${section}/:id`, (req, res) => {
    getItemById(section, req.params.id, res);
  });
});

// Dynamic route for /songs/:id
app.get('/songs/:id', (req, res) => {
  getItemById('songs', req.params.id, res);
});

// 🧯 Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 🚦 Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
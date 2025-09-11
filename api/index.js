
// api/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../src/lib/db.js';
import { signup, login, logout, updateProfile } from '../controllers/auth.controller.js';

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';


dotenv.config();

const app = express();
// app.use(cors());
app.use(cors({
  origin: ['https://jpmusic.appwrite.network', 'http://localhost:3000'], // or your frontend domain
  credentials: true
}));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
  res.send('Welcome to the API root!');
});
app.post('/signup', signup);
app.post('/login', login);
app.post('/logout', logout);
app.put('/update-profile', updateProfile);

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


app.get('/songs', (req, res) => {
  const query = req.query.q?.toLowerCase();
  const artistID = req.query.artistID;
  const albumID = req.query.albumID;
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

      if (artistID) {
        results = results.filter(song => song.artistID === parseInt(artistID));
        
      }
      if (albumID) {
        results = results.filter(song => song.albumID === parseInt(albumID));
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


// export default function handler(req, res) {
//   app(req, res);
// }
export default async function handler(req, res) {
  try {
    await connectDB(); // ✅ Ensure DB is connected before handling request
    app(req, res);     // ✅ Pass request to Express
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
// // 🚦 Start server
// app.listen(PORT, () => {
//   console.log('Server is running on port: ', PORT);
//   connectDB();
// });

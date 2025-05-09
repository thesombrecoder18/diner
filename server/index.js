import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { body, validationResult } from 'express-validator';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import multer from 'multer';


// ==== Définitions de __dirname pour ES Modules ====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import DB config et secret
const { DB_CONFIG, JWT_SECRET } = await import('../src/config/constants.js');

// Initialise l’app
const app = express();
const port = 3001;

// Middleware JSON, cookies, CORS
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Sert static le dossier uploads
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'))
);

// Crée le dossier uploads s’il n’existe pas
await fs.mkdir(path.join(__dirname, '..', 'uploads'), { recursive: true });

// Configure multer
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

// Pool MySQL
const pool = mysql.createPool({
  ...DB_CONFIG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ----- AUTH ROUTES -----
app.post(
  '/api/auth/login',
  body('username').isString(),
  body('password').isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
      const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
      const admin = rows[0];
      if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
      const match = await bcrypt.compare(password, admin.password);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });
      res.json({ id: admin.id, username: admin.username });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query('SELECT id, username FROM admins WHERE id = ?', [decoded.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
});

// ----- SETTINGS ROUTES -----
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings WHERE id = 1');
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put(
  '/api/settings/:id',
  body('voting_active').isBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }
    const { id } = req.params;
    const { voting_active } = req.body;
    try {
      await pool.query('UPDATE settings SET voting_active = ? WHERE id = ?', [voting_active, id]);
      res.json({ message: 'Settings updated successfully' });
    } catch (err) {
      console.error('Error updating settings:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ----- CANDIDATES ROUTES -----
app.get('/api/candidates', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM candidates');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post(
  '/api/candidates',
  upload.single('image'),
  body('name').isString(),
  body('gender').isIn(['king', 'queen']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) await fs.unlink(req.file.path);
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }
    const { name, gender, imageUrl } = req.body;
    try {
      // Insert initial
      const [result] = await pool.query(
        'INSERT INTO candidates (name, gender, image_url) VALUES (?, ?, ?)',
        [name, gender, '']
      );
      const candidateId = result.insertId;
      let finalUrl = imageUrl || '';

      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const newFilename = `${candidateId}_${Date.now()}${ext}`;
        const oldPath = req.file.path;
        const newPath = path.join(path.dirname(oldPath), newFilename);
        await fs.rename(oldPath, newPath);
        finalUrl = `/uploads/${newFilename}`;
      }

      // Update image_url
      await pool.query('UPDATE candidates SET image_url = ? WHERE id = ?', [finalUrl, candidateId]);

      res.json({
        message: 'Candidate created successfully',
        candidate: { id: candidateId, name, gender, image_url: finalUrl }
      });
    } catch (err) {
      console.error('Error creating candidate:', err);
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      res.status(500).json({ message: 'Server error' });
    }
  }
);

app.put(
  '/api/candidates/:id',
  body('name').optional().isString(),
  body('gender').optional().isIn(['king', 'queen']),
  body('image_url').optional().isURL(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }
    const { id } = req.params;
    const { name, gender, image_url } = req.body;
    try {
      await pool.query(
        `UPDATE candidates 
           SET name = COALESCE(?, name), 
               gender = COALESCE(?, gender), 
               image_url = COALESCE(?, image_url) 
         WHERE id = ?`,
        [name, gender, image_url, id]
      );
      res.json({ message: 'Candidate updated successfully' });
    } catch (err) {
      console.error('Error updating candidate:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

app.delete('/api/candidates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM candidates WHERE id = ?', [id]);
    res.json({ message: 'Candidate deleted successfully' });
  } catch (err) {
    console.error('Error deleting candidate:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----- VOTES ROUTES -----
app.get('/api/votes/check', async (req, res) => {
  const userIp = req.ip;
  try {
    const [rows] = await pool.query('SELECT * FROM votes WHERE user_ip = ?', [userIp]);
    res.json({ hasVoted: rows.length > 0 });
  } catch (err) {
    console.error('Error checking vote:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post(
  '/api/votes',
  body('king_id').isInt(),
  body('queen_id').isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }
    const { king_id, queen_id } = req.body;
    const userIp = req.ip;
    try {
      const [existing] = await pool.query('SELECT * FROM votes WHERE user_ip = ?', [userIp]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'You have already voted' });
      }
      await pool.query('INSERT INTO votes (user_ip, king_id, queen_id) VALUES (?, ?, ?)', [userIp, king_id, queen_id]);
      res.json({ message: 'Vote submitted successfully' });
    } catch (err) {
      console.error('Error submitting vote:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

app.get('/api/votes/results', async (req, res) => {
  try {
    const [kingRows] = await pool.query(
      `SELECT c.id AS candidateId, c.name AS candidateName, COUNT(v.id) AS voteCount
         FROM votes v JOIN candidates c ON v.king_id = c.id
        GROUP BY c.id, c.name`
    );
    const [queenRows] = await pool.query(
      `SELECT c.id AS candidateId, c.name AS candidateName, COUNT(v.id) AS voteCount
         FROM votes v JOIN candidates c ON v.queen_id = c.id
        GROUP BY c.id, c.name`
    );
    res.json({ kings: kingRows, queens: queenRows });
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/votes', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.id, v.user_ip, k.name AS kingName, q.name AS queenName, v.created_at
         FROM votes v
         JOIN candidates k ON v.king_id = k.id
         JOIN candidates q ON v.queen_id = q.id`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching votes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----- ADMIN CREATION ROUTE -----
app.post(
  '/api/admins',
  body('username').isString().isLength({ min: 1 }).withMessage('Username is required'),
  body('password').isString().isLength({ min: 1 }).withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword]);
      res.json({ message: 'Admin account created successfully' });
    } catch (err) {
      console.error('Error creating admin:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ----- ADMIN STATS ROUTE -----
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [[{ totalCandidates }]] = await pool.query('SELECT COUNT(*) AS totalCandidates FROM candidates');
    const [[{ totalKings }]] = await pool.query("SELECT COUNT(*) AS totalKings FROM candidates WHERE gender = 'king'");
    const [[{ totalQueens }]] = await pool.query("SELECT COUNT(*) AS totalQueens FROM candidates WHERE gender = 'queen'");
    const [[{ totalVotes }]] = await pool.query('SELECT COUNT(*) AS totalVotes FROM votes');
    const [[{ votingActive }]] = await pool.query('SELECT voting_active AS votingActive FROM settings WHERE id = 1');
    res.json({ totalCandidates, totalKings, totalQueens, totalVotes, votingActive: !!votingActive });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----- ADMIN VOTE STATS ROUTE -----
app.get('/api/admin/vote-stats', async (req, res) => {
  try {
    const [kingStats] = await pool.query(
      `SELECT c.id AS candidateId, c.name AS candidateName, COUNT(v.id) AS voteCount
         FROM candidates c
         LEFT JOIN votes v ON c.id = v.king_id
        WHERE c.gender = 'king'
        GROUP BY c.id, c.name`
    );
    const [queenStats] = await pool.query(
      `SELECT c.id AS candidateId, c.name AS candidateName, COUNT(v.id) AS voteCount
         FROM candidates c
         LEFT JOIN votes v ON c.id = v.queen_id
        WHERE c.gender = 'queen'
        GROUP BY c.id, c.name`
    );
    res.json({ kings: kingStats, queens: queenStats });
  } catch (err) {
    console.error('Error fetching vote stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.put(
  '/api/settings',
  // On attend un booléen dans le corps JSON sous la clé "votingActive"
  body('votingActive').isBoolean(),
  async (req, res) => {
    // Validation des paramètres
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Invalid input', errors: errors.array() });
    }

    const { votingActive } = req.body;

    try {
      // Mise à jour en base pour l'enregistrement id = 1
      await pool.query(
        'UPDATE settings SET voting_active = ? WHERE id = 1',
        [votingActive]
      );
      return res.json({ message: 'Voting status updated successfully' });
    } catch (err) {
      console.error('PUT /api/settings error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);
// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Database connected: successfully`);
});

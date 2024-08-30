const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { Pool } = require('pg');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'https://musicalmatchbackend.onrender.com',
    'https://musicalmatch.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.spotify.com", "'sha256-YqD0Y6nJN+K0Y08J+Ena6eHgZrJ7WcWbIsC/u7GiyVk='"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://*.spotify.com"],
        connectSrc: ["'self'", "https://accounts.spotify.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        frameSrc: ["https://accounts.spotify.com"], 
        upgradeInsecureRequests: [],
      },
    },
  })
);

// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

let spotifyToken = '';

const getSpotifyToken = async () => {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64'),
      },
      params: {
        grant_type: 'client_credentials',
      },
    });

    spotifyToken = response.data.access_token;
  } catch (error) {
    console.error('Error fetching Spotify token:', error.message);
  }
};

setInterval(getSpotifyToken, 3600000); // Fetch token every hour
getSpotifyToken();

app.get('/spotify-token', (req, res) => {
  if (!spotifyToken) {
    return res.status(500).json({ error: 'Token not available' });
  }
  res.json({ token: spotifyToken });
});

app.post('/api/save-answers', async (req, res) => {
  const { userId, answers } = req.body;
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (let answer of answers) {
        await client.query(
          `INSERT INTO user_answers (user_id, question_id, selected_option, selected_option_index)
           VALUES ($1, $2, $3, $4)`,
          [userId, answer.questionId, answer.selectedOption, answer.selectedOptionIndex]
        );
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error saving answers:', err.stack);
    res.status(500).json({ success: false });
  }
});
app.get('/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, phone, first_name, last_name, age, location, bio, profile_picture, similarity_score
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});
app.get('/UserProfile', async (req, res) => {
  const { code } = req.query;

  console.log('Received OAuth callback with code:', code);

  if (!code) {
    console.error('Authorization code not provided');
    return res.status(400).send('Authorization code not provided');
  }

  try {
    console.log('Exchanging code for access token...');
    const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://musicalmatch.onrender.com/UserProfile',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('Received response from Spotify API:', response.data);

    const { access_token } = response.data;

    console.log('Access token:', access_token);

    res.redirect(`https://musicalmatch.onrender.com/profile?access_token=${access_token}`);
  } catch (error) {
    console.error('Error handling OAuth callback:', error.message);
    console.error('Error details:', error.response ? error.response.data : error);
    res.status(500).send('Server Error');
  }
});

app.get('/profiles', async (req, res) => {
  const userId = parseInt(req.query.userId, 10);

  try {
    const result = await pool.query(`
      SELECT id AS user_id, first_name, last_name, email, profile_picture 
      FROM users
      WHERE id != $1 
        AND id NOT IN (
          SELECT liked_user_id FROM user_likes WHERE user_id = $1
        )
      LIMIT 10
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching profiles:', err);
    res.status(500).send('Server Error');
  }
});

app.post('/like', async (req, res) => {
  const { userId, likedUserId } = req.body;

  console.log('Received data:', { userId, likedUserId });

  try {
    if (!userId || !likedUserId) {
      return res.status(400).json({ error: 'Missing userId or likedUserId' });
    }

    const userResult = await pool.query('SELECT 1 FROM users WHERE id = $1', [userId]);
    if (userResult.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const likedUserResult = await pool.query('SELECT 1 FROM users WHERE id = $1', [likedUserId]);
    if (likedUserResult.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid liked user ID' });
    }

    await pool.query(
      `INSERT INTO user_likes (user_id, liked_user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, likedUserId]
    );

    res.status(200).json({ message: 'Profile liked successfully' });
  } catch (error) {
    console.error('Error liking profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/dislike', async (req, res) => {
  const { userId, profileId } = req.body;

  try {
    if (!userId || !profileId) {
      return res.status(400).json({ error: 'Missing userId or profileId' });
    }

    const userResult = await pool.query('SELECT 1 FROM users WHERE id = $1', [userId]);
    if (userResult.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    await pool.query(
      `INSERT INTO user_dislikes (user_id, profile_id, dislike_data)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, profile_id)
       DO UPDATE SET dislike_data = excluded.dislike_data`,
      [userId, profileId]
    );

    res.status(200).json({ message: 'Profile disliked successfully' });
  } catch (error) {
    console.error('Error disliking profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/signup', async (req, res) => {
  const { firstName, lastName, password, email, phone, location, age } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (first_name, last_name, password, email, phone, location, age)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [firstName, lastName, hashedPassword, email, phone, location, age]
    );

    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (err) {
    console.error('Error signing up:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.post('/signin', async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT id, email, phone, first_name, last_name, age, location, bio, profile_picture, similarity_score, password 
       FROM users WHERE email = $1 OR phone = $2`,
      [emailOrPhone, emailOrPhone]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Exclude the password before sending the user data back to the client
    const { password: userPassword, ...userWithoutPassword } = user;

    res.json({ success: true, user: userWithoutPassword });
  } catch (err) {
    console.error('Error signing in:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


app.listen(3000, () => {
  console.log('Server running on port 3000');
});

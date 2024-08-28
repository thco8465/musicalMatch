const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors({
  origin: 'https://musicalmatch.onrender.com',
}));
app.use(bodyParser.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      },
    },
  })
);

// Create a new pool instance with environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
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

// Fetch profiles excluding the current user and profiles that have already been liked
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
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [emailOrPhone, emailOrPhone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const { password: _, ...userData } = user;
    res.json({ success: true, user: userData });
  } catch (err) {
    console.error('Error signing in:', err);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

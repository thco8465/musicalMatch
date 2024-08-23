const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors());
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

const pool = new Pool({
  user: 'musicuser',
  host: 'localhost',
  database: 'musicdb',
  password: 'ArkhamknightN7?',
  port: 5432,
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
      LIMIT 10; -- Limit the number of profiles returned
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching profiles: ', err);
    res.status(500).send('Server Error');
  }
});
app.post('/like', async (req, res) => {
  const { userId, likedUserId } = req.body;

  // Log the received data for debugging
  console.log('Received data:', { userId, likedUserId });

  try {
    // Check if userId and likedUserId are provided
    if (!userId || !likedUserId) {
      return res.status(400).json({ error: 'Missing userId or likedUserId' });
    }

    // Check if userId exists in users table
    const userResult = await pool.query('SELECT 1 FROM users WHERE id = $1', [userId]);
    if (userResult.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if likedUserId exists in users table
    const likedUserResult = await pool.query('SELECT 1 FROM users WHERE id = $1', [likedUserId]);
    if (likedUserResult.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid liked user ID' });
    }

    // Record the like in the user_likes table
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

// Fetch profiles who liked a specific user's profile
app.get('/likes/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.*
       FROM users u
       JOIN user_likes ul ON u.id = ul.user_id
       WHERE ul.liked_user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching likes:', err);
    res.status(500).send('Server Error');
  }
});



app.post('/like', async (req, res) => {
  const { userId, likedUserId } = req.body;

  console.log('Server received:', { userId, likedUserId }); // Debug log

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



// Example sign-up route
app.post('/signup', async (req, res) => {
  const { firstName, lastName, password, email, phone, location, age } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into the database
    await pool.query(
      `INSERT INTO users (first_name, last_name, password, email, phone, location, age)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [firstName, lastName, hashedPassword, email, phone, location, age]
    );

    // Return a success response
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (err) {
    console.error('Error signing up:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Example sign-in route
app.post('/signin', async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    // Query the database for the user by email or phone
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [emailOrPhone, emailOrPhone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Return user data excluding the password
    const { password: _, ...userData } = user; // Rename 'password' to '_' to exclude it from the response
    res.json({ success: true, user: userData });
  } catch (err) {
    console.error('Error signing in:', err);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

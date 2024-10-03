import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kingoMaps',
  password: '123456',
  port: 5432,
});

// Endpoint: Create a new user with user roll default
app.post('/sign-up', async (req, res) => {
  const { userName, userPassword } = req.body;

  if (!userName || !userPassword) {
    return res.status(400).send('Username and password are required');
  }

  try {
    // Check if user already exist
    const existingUser = await pool.query('SELECT * FROM users WHERE userName = $1;', [userName]);
    if (existingUser.rows.length > 0) {
      return res.status(400).send('User already exists');
    }

    // Encrypt password with hash and salt
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Insert new user in the database
    const result = await pool.query(
      'INSERT INTO users (idRoll, userName, userPassword, createAt, updateAt, state) VALUES ($1, $2, $3, NOW(), NOW(), $4) RETURNING *;',
      [2, userName, hashedPassword, 'active']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint: Sign In
app.post('/sign-in', async (req, res) => {
  const { userName, userPassword } = req.body;

  try {
    // Check if user already exists
    const result = await pool.query(
      'SELECT * FROM users WHERE userName = $1',
      [userName]
    );

    if (result.rows.length === 0) {
      return res.status(400).send('User not found');
    }

    const user = result.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(userPassword, user.userpassword);

    if (isMatch) {
      res.status(200).json({ idRoll: user.idroll, message: 'Login successful' });
    } else {
      res.status(400).send('Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/cellTowers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cellTowers LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/cellTowers-networkType', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cellTowers LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/cellTowers/:networkType/:limit', async (req, res) => {
  const networkType = req.params.networkType;
  const limit = req.params.limit == 0 ? null : req.params.limit;

  try {
    const result = await pool.query(`
      SELECT 
        u.idUbication,
        u.lng,
        u.lat,
        u.country,
        u.department,
        u.city,
        u.direction,
        ct.idCellTower,
        ct.networkType,
        ct.mobileCountryCode,
        ct.mobileNetworkCode,
        ct.samples,
        ct.area,
        ct.cell,
        ct.kmRange
      FROM 
        ubication u
      INNER JOIN 
        cellTowers ct ON u.idUbication = ct.idUbication
      WHERE
        networkType=$1
      LIMIT $2
      `, [networkType, limit]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/cellTowers-type-networkType', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT networkType FROM cellTowers');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint: All markers with ubications
app.get('/markers/:idCategory/:country/:department/:city/:limit', async (req, res) => {
  const {idCategory, country, department, city} = req.params;
  // if limit is 0 then null, if is not 0 then the valor
  const limit = req.params.limit == 0 ? null : req.params.limit;
  try {
    const result = await pool.query(`
      SELECT m.idMarker, m.markerTitle, m.markerDescription, m.markerCircleRadius, m.markerColor, m.state,
      u.lng, u.lat, u.country, u.department, u.city, u.direction, u.idCategory
      FROM marker m 
      JOIN ubication u ON m.idUbication = u.idUbication
      WHERE m.state = 'active' AND u.idCategory = $1 AND u.country = $2 
      AND u.department = $3 AND u.city = $4
      LIMIT $5
    `, [idCategory, country, department, city, limit]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint: Get categories data
app.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM category ORDER BY idcategory ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint: Update marker to inactive
app.put('/markers/:id', (req, res) => {
  const markerId = req.params.id;

  const query = 'UPDATE marker SET state = $1 WHERE idMarker = $2';
  pool.query(query, ['inactive', markerId], (err, results) => {
    if (err) {
      console.error('Error updating marker:', err);
      return res.status(500).json({ error: 'Failed to update marker' });
    }

    if (results.rowCount > 0) {
      res.status(200).json({ message: 'Marker updated to inactive successfully' });
    } else {
      res.status(404).json({ message: 'Marker not found' });
    }
  });
});

app.put('/area/:id', (req, res) => {
  const idPolygonDelimitedArea = req.params.id;

  const query = 'UPDATE polygonDelimitedArea SET state = $1 WHERE idPolygonDelimitedArea = $2';
  pool.query(query, ['inactive', idPolygonDelimitedArea], (err, results) => {
    if (err) {
      console.error('Error updating marker:', err);
      return res.status(500).json({ error: 'Failed to update marker' });
    }

    if (results.rowCount > 0) {
      res.status(200).json({ message: 'Marker updated to inactive successfully' });
    } else {
      res.status(404).json({ message: 'Marker not found' });
    }
  });

  const query2 = 'UPDATE polygonCoordinates SET state = $1 WHERE idPolygonDelimitedArea = $2';
  pool.query(query2, ['inactive', idPolygonDelimitedArea], (err, results) => {
    if (err) {
      console.error('Error updating marker:', err);
      return res.status(500).json({ error: 'Failed to update marker' });
    }
  });
});

app.put('/update-areaName/:id', (req, res) => {
  const idPolygonDelimitedArea = req.params.id;
  const { areaName } = req.body;

  const query = 'UPDATE polygonDelimitedArea SET areaName = $1 WHERE idPolygonDelimitedArea = $2';
  pool.query(query, [areaName, idPolygonDelimitedArea], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Failed to update marker' });
    }

    if (results.rowCount > 0) {
      res.status(200).json({ message: 'Marker updated successfully' });
    } else {
      res.status(404).json({ message: 'Marker not found' });
    }
  });
});

// Endpoint: update marker data
app.put('/updated-marker/:id', (req, res) => {
  const idMarker = req.params.id;
  const { markerTitle, markerDescription, markerCircleRadius, markerColor } = req.body;

  const query = 'UPDATE marker SET markerTitle=$1, markerDescription=$2, markerCircleRadius=$3, markerColor=$4, updateAt=NOW() WHERE idMarker = $5';
  pool.query(query, [markerTitle, markerDescription, markerCircleRadius, markerColor, idMarker], (err, results) => {
    if (err) {
      console.error('Error updating marker:', err);
      return res.status(500).json({ error: 'Failed to update marker' });
    }

    if (results.rowCount > 0) {
      res.status(200).json({ message: 'Marker updated successfully' });
    } else {
      res.status(404).json({ message: 'Marker not found' });
    }
  });
});

// Endpoint: Get polygon delimited area data
app.get('/polygon-delimited-area', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM polygonDelimitedArea WHERE state=$1', ['active']);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint: Get polygon coordinates
app.get('/polygon-data-order-by-id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM polygonCoordinates WHERE state=$1 ORDER BY idPolygonCoordinates ASC', ['active']);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET first id from polygonCOORDINATES
app.get('/area-first-id', async (req, res) => {
  try {
    const result = await pool.query('SELECT idPolygonDelimitedArea FROM polygonDelimitedArea WHERE idPolygonDelimitedArea=(SELECT MIN(idPolygonDelimitedArea) FROM polygonCoordinates) AND state=$1', ['active']);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET last id
app.get('/coordinates-last-id', async (req, res) => {
  try {
    const result = await pool.query('SELECT idPolygonCoordinates, idPolygonDelimitedArea FROM polygonCoordinates WHERE idPolygonCoordinates = (SELECT MAX(idPolygonCoordinates) FROM polygonCoordinates)');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint: Get polygon delimited area
app.get('/polygon-coordinates', async (req, res) => {
  try {
    const result = await pool.query('SELECT idPolygonDelimitedArea, COUNT(*) FROM polygonCoordinates GROUP BY idPolygonDelimitedArea HAVING COUNT(*) > 1;');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/validate-coordinates', async (req, res) => {
  try {
    const result = await pool.query('SELECT lng, lat FROM ubication');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint: Add new ubication
app.post('/ubication', async (req, res) => {
  const { lng, lat, country, department, city, direction, idCategory, idPolygonDelimitedArea } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO ubication (idCategory, idPolygonDelimitedArea, lng, lat, country, department, city, direction, createAt, updateAt, state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9) RETURNING idUbication;',
      [idCategory, idPolygonDelimitedArea, lng, lat, country, department, city, direction, 'active']
    );
    
    res.status(201).json(result.rows[0]); // Return: idUbication
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// Endpoint: Add new marker
app.post('/markers', async (req, res) => {
  const { markerTitle, markerDescription, markerCircleRadius, markerColor } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO marker (idUbication, markerTitle, markerDescription, markerCircleRadius, markerColor, createAt, updateAt, state) VALUES ((SELECT idUbication FROM ubication ORDER BY idUbication DESC LIMIT 1), $1, $2, $3, $4, NOW(), NOW(), $5) RETURNING *;',
      [markerTitle, markerDescription, markerCircleRadius, markerColor, 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint: Add new category
app.post('/category', async (req, res) => {
  const { category } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO category (category, createAt, updateAt, state) VALUES ($1, NOW(), NOW(), $2) RETURNING *;',
      [category, 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint: Add new polygon Area
app.post('/polygon-area', async (req, res) => {
  const { areaName } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO polygonDelimitedArea (areaName, createAt, updateAt, state) VALUES ($1, NOW(), NOW(), $2) RETURNING idPolygonDelimitedArea;',
      [areaName, 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint: Insert polygon coordinates
app.post('/polygon-coordinates', async (req, res) => {
  const { coordinates } = req.body;

  // Validated coordinates
  if (!Array.isArray(coordinates) || coordinates.some(coord => typeof coord.lat !== 'number' || typeof coord.lng !== 'number')) {
      return res.status(400).send('Formato de coordenadas no válido.');
  }

  try {
      // Insert coordinates in order
      const insertedCoordinates = [];

      for (const coord of coordinates) {
          const result = await pool.query(
              'INSERT INTO polygonCoordinates (idPolygonDelimitedArea, lng, lat, createAt, updateAt, state) VALUES ((SELECT idPolygonDelimitedArea FROM polygonDelimitedArea ORDER BY idPolygonDelimitedArea DESC LIMIT 1), $1, $2, NOW(), NOW(), $3) RETURNING *',
              [coord.lng, coord.lat, 'active']
          );
          insertedCoordinates.push(result.rows[0]);
      }

      // Response with insert coordinates
      res.status(201).json(insertedCoordinates);
  } catch (err) {
      console.error('Error al insertar coordenadas:', err);
      res.status(500).send('Error en el servidor al guardar coordenadas.');
  }
});

// Endpoint: GET countrys of table ubication
app.get('/ubication-country', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT country FROM ubication');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/ubication-department', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT department FROM ubication');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/ubication-city', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT city FROM ubication');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
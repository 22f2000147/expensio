const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes

// GET /api/todos - Get all todos
app.get('/api/todos', (req, res) => {
  const { search, category } = req.query;

  let sql = 'SELECT * FROM todos WHERE 1=1';
  let params = [];

  if (search) {
    sql += ' AND title LIKE ?';
    params.push(`%${search}%`);
  }

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  sql += ' ORDER BY created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST /api/todos - Create a new todo
app.post('/api/todos', (req, res) => {
  const { title, category = 'General' } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const sql = 'INSERT INTO todos (title, category) VALUES (?, ?)';
  db.run(sql, [title, category], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Get the inserted todo
    db.get('SELECT * FROM todos WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(row);
    });
  });
});

// PUT /api/todos/:id - Update a todo (mark as completed or update title/category)
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, category, completed } = req.body;

  if (title === undefined && category === undefined && completed === undefined) {
    return res.status(400).json({ error: 'Title, category, or completed status is required' });
  }

  let sql, params;

  if (title !== undefined && category !== undefined && completed !== undefined) {
    sql = 'UPDATE todos SET title = ?, category = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [title, category, completed, id];
  } else if (title !== undefined && category !== undefined) {
    sql = 'UPDATE todos SET title = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [title, category, id];
  } else if (title !== undefined && completed !== undefined) {
    sql = 'UPDATE todos SET title = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [title, completed, id];
  } else if (category !== undefined && completed !== undefined) {
    sql = 'UPDATE todos SET category = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [category, completed, id];
  } else if (title !== undefined) {
    sql = 'UPDATE todos SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [title, id];
  } else if (category !== undefined) {
    sql = 'UPDATE todos SET category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [category, id];
  } else {
    sql = 'UPDATE todos SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [completed, id];
  }

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Get the updated todo
    db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row);
    });
  });
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM todos WHERE id = ?';
  db.run(sql, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TODO API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
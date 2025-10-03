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
  const { search, category, priority, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

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

  if (priority) {
    sql += ' AND priority = ?';
    params.push(priority);
  }

  // Validate sortBy parameter
  const validSortFields = ['created_at', 'title', 'category', 'priority', 'completed'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';

  // Validate sortOrder parameter
  const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  sql += ` ORDER BY ${sortField} ${sortDirection}`;

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
  const { title, category = 'General', priority = 'Medium' } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Validate priority
  const validPriorities = ['Low', 'Medium', 'High'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Priority must be one of: Low, Medium, High' });
  }

  const sql = 'INSERT INTO todos (title, category, priority) VALUES (?, ?, ?)';
  db.run(sql, [title, category, priority], function(err) {
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

// PUT /api/todos/:id - Update a todo (mark as completed or update title/category/priority)
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, category, priority, completed } = req.body;

  if (title === undefined && category === undefined && priority === undefined && completed === undefined) {
    return res.status(400).json({ error: 'Title, category, priority, or completed status is required' });
  }

  // Validate priority if provided
  if (priority !== undefined) {
    const validPriorities = ['Low', 'Medium', 'High'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Priority must be one of: Low, Medium, High' });
    }
  }

  let sql, params;

  // Handle all combinations of fields that might be updated
  const fieldsToUpdate = [];
  const values = [];

  if (title !== undefined) {
    fieldsToUpdate.push('title = ?');
    values.push(title);
  }
  if (category !== undefined) {
    fieldsToUpdate.push('category = ?');
    values.push(category);
  }
  if (priority !== undefined) {
    fieldsToUpdate.push('priority = ?');
    values.push(priority);
  }
  if (completed !== undefined) {
    fieldsToUpdate.push('completed = ?');
    values.push(completed);
  }

  // Always update the updated_at timestamp
  fieldsToUpdate.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  sql = `UPDATE todos SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

  db.run(sql, values, function(err) {
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
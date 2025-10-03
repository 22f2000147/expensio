const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3');

// Create a test database
const testDb = new sqlite3.Database(':memory:');

// Create the todos table for testing
testDb.serialize(() => {
  testDb.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT DEFAULT "General",
      priority TEXT DEFAULT "Medium",
      completed BOOLEAN DEFAULT 0,
      due_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert test data
  testDb.run(`INSERT INTO todos (title, category, priority, due_date) VALUES (?, ?, ?, ?)`,
    ['Test Todo 1', 'Work', 'High', '2024-12-31']);

  testDb.run(`INSERT INTO todos (title, category, priority, due_date) VALUES (?, ?, ?, ?)`,
    ['Test Todo 2', 'Personal', 'Medium', null]);
});

// Create a simple Express app for testing
const app = express();
app.use(express.json());

// Test routes
app.get('/api/todos', (req, res) => {
  const { sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

  const validSortFields = ['created_at', 'title', 'category', 'priority', 'completed', 'due_date'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const sql = `SELECT * FROM todos ORDER BY ${sortField} ${sortDirection}`;

  testDb.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Add is_overdue field to each todo
    const todosWithOverdueStatus = rows.map(todo => {
      const isOverdue = todo.due_date &&
        !todo.completed &&
        new Date(todo.due_date) < new Date().setHours(0, 0, 0, 0);

      return {
        ...todo,
        is_overdue: isOverdue
      };
    });

    res.json(todosWithOverdueStatus);
  });
});

app.post('/api/todos', (req, res) => {
  const { title, category = 'General', priority = 'Medium', dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Validate priority
  const validPriorities = ['Low', 'Medium', 'High'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Priority must be one of: Low, Medium, High' });
  }

  // Validate due date if provided
  if (dueDate) {
    const dueDateObj = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(dueDateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid due date format. Please use YYYY-MM-DD format.' });
    }

    if (dueDateObj < today) {
      return res.status(400).json({ error: 'Due date cannot be in the past.' });
    }
  }

  const sql = 'INSERT INTO todos (title, category, priority, due_date) VALUES (?, ?, ?, ?)';
  testDb.run(sql, [title, category, priority, dueDate || null], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    testDb.get('SELECT * FROM todos WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Add is_overdue field
      const isOverdue = row.due_date &&
        !row.completed &&
        new Date(row.due_date) < new Date().setHours(0, 0, 0, 0);

      res.status(201).json({ ...row, is_overdue: isOverdue });
    });
  });
});

describe('Due Date API Tests', () => {
  test('GET /api/todos should return todos with is_overdue field', async () => {
    const response = await request(app)
      .get('/api/todos')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    // Check that each todo has is_overdue field
    response.body.forEach(todo => {
      expect(todo).toHaveProperty('is_overdue');
      expect(typeof todo.is_overdue).toBe('boolean');
    });
  });

  test('GET /api/todos should sort by due_date', async () => {
    const response = await request(app)
      .get('/api/todos?sortBy=due_date&sortOrder=ASC')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    // Check that todos are sorted by due_date (nulls first, then dates)
    for (let i = 0; i < response.body.length - 1; i++) {
      const current = response.body[i].due_date;
      const next = response.body[i + 1].due_date;

      if (current && next) {
        expect(new Date(current).getTime()).toBeLessThanOrEqual(new Date(next).getTime());
      }
    }
  });

  test('POST /api/todos should create todo with due date', async () => {
    const futureDate = '2025-12-31';
    const response = await request(app)
      .post('/api/todos')
      .send({
        title: 'Test Todo with Due Date',
        category: 'Work',
        priority: 'High',
        dueDate: futureDate
      })
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Todo with Due Date');
    expect(response.body.due_date).toBe(futureDate);
    expect(response.body.is_overdue).toBe(false); // Future date should not be overdue
  });

  test('POST /api/todos should reject past due date', async () => {
    const pastDate = '2020-01-01';
    const response = await request(app)
      .post('/api/todos')
      .send({
        title: 'Test Todo with Past Due Date',
        category: 'Work',
        priority: 'High',
        dueDate: pastDate
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.error).toBe('Due date cannot be in the past.');
  });

  test('POST /api/todos should reject invalid due date format', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({
        title: 'Test Todo with Invalid Due Date',
        category: 'Work',
        priority: 'High',
        dueDate: 'invalid-date'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.error).toBe('Invalid due date format. Please use YYYY-MM-DD format.');
  });

  test('POST /api/todos should create todo without due date', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({
        title: 'Test Todo without Due Date',
        category: 'Personal',
        priority: 'Low'
      })
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Todo without Due Date');
    expect(response.body.due_date).toBeNull();
    expect(response.body.is_overdue).toBe(false); // No due date means not overdue
  });
});
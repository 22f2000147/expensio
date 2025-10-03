const sqlite3 = require('sqlite3').verbose();

// Create and connect to SQLite database
const db = new sqlite3.Database('./todos.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database with todos table
function initializeDatabase() {
// First, check if category column exists
db.all("PRAGMA table_info(todos)", [], (err, columns) => {
  if (err) {
    console.error('Error checking table info:', err.message);
    return;
  }

  const hasCategoryColumn = columns.some(col => col.name === 'category');
  const hasPriorityColumn = columns.some(col => col.name === 'priority');
  const hasDueDateColumn = columns.some(col => col.name === 'due_date');

  if (!hasCategoryColumn) {
    // Add category column to existing table
    const addCategorySQL = 'ALTER TABLE todos ADD COLUMN category TEXT DEFAULT "General"';
    db.run(addCategorySQL, (err) => {
      if (err) {
        console.error('Error adding category column:', err.message);
      } else {
        console.log('Category column added to todos table');
      }
    });
  }

  if (!hasPriorityColumn) {
    // Add priority column to existing table
    const addPrioritySQL = 'ALTER TABLE todos ADD COLUMN priority TEXT DEFAULT "Medium"';
    db.run(addPrioritySQL, (err) => {
      if (err) {
        console.error('Error adding priority column:', err.message);
      } else {
        console.log('Priority column added to todos table');
      }
    });
  }

  if (!hasDueDateColumn) {
    // Add due_date column to existing table
    const addDueDateSQL = 'ALTER TABLE todos ADD COLUMN due_date TEXT';
    db.run(addDueDateSQL, (err) => {
      if (err) {
        console.error('Error adding due_date column:', err.message);
      } else {
        console.log('Due date column added to todos table');
      }
    });
  }
});

  const createTableSQL = `
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
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('Error creating todos table:', err.message);
    } else {
      console.log('Todos table ready');

      // Create index for efficient querying of overdue tasks
      const createIndexSQL = 'CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date)';
      db.run(createIndexSQL, (err) => {
        if (err) {
          console.error('Error creating due_date index:', err.message);
        } else {
          console.log('Due date index created');
        }
      });
    }
  });
}

module.exports = db;
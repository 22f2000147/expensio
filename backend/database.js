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
  });

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT DEFAULT "General",
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('Error creating todos table:', err.message);
    } else {
      console.log('Todos table ready');
    }
  });
}

module.exports = db;
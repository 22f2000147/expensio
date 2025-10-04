# TODO App - System Architecture

## Overview

The TODO application is a full-stack web application built with modern technologies, featuring a React frontend, Node.js/Express backend, and SQLite database. The application provides comprehensive task management capabilities with advanced filtering, categorization, progress tracking, and visual enhancements.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                            Frontend (React)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   App.js    │  │ TodoForm.js │  │ TodoList.js │  │ Theme   │ │
│  │ (Main App)  │  │ (Modal Form)│  │ (Task List) │  │ Context │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ProgressBar.js│  │Category-    │  │TodoItem.js  │  │ Framer  │ │
│  │(Progress &   │  │Bubble.js    │  │(Individual  │  │ Motion  │ │
│  │ Confetti)   │  │(Filter UI)  │  │ Task)       │  │Animations│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    HTTP/REST API (Axios)                       │
├─────────────────────────────────────────────────────────────────┤
│                          Backend (Express)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ server.js   │  │ database.js │  │   SQLite    │  │  CORS   │ │
│  │ (API Routes)│  │ (DB Config) │  │  Database   │  │  & Body │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  │ Parser  │ │
│           │              │              │             └─────────┘ │
│           └──────────────┼──────────────┼─────────────────────────┘
│                        │              │
└────────────────────────┼──────────────┼─────────────────────────┘
                         │              │
            ┌────────────▼──────────────▼────────────┐
            │              Data Flow                 │
            │  ┌───────────────────────────────────┐  │
            │  │ GET /api/todos?search=term&...    │  │
            │  │ POST /api/todos                   │  │
            │  │ PUT /api/todos/:id                │  │
            │  │ DELETE /api/todos/:id             │  │
            │  └───────────────────────────────────┘  │
            └─────────────────────────────────────────┘
```

## Frontend Architecture (React)

### Core Components

**App.js** - Main application component that orchestrates the entire frontend
- State management for todos, filters, search, and sorting
- API communication with the backend
- Theme provider integration
- Filter and search functionality coordination

**TodoForm.js** - Modal form component for creating new todos
- Title input with validation
- Category selection with predefined options
- Priority selection (Low, Medium, High)
- Due date picker with date validation
- Animated modal with backdrop click and escape key handling

**TodoList.js** - Container component for displaying todos
- Renders list of TodoItem components
- Handles todo updates and deletions
- Passes callback functions to child components

**TodoItem.js** - Individual todo item component
- Displays todo information (title, category, priority, due date)
- Completion status toggle
- Edit and delete functionality
- Visual indicators for overdue tasks

### Advanced Features

**ProgressBar.js** - Progress tracking with celebration features
- Calculates completion percentage
- Animated progress bar with spring animations
- Confetti animation when reaching 100% completion
- Accessibility support with ARIA attributes

**CategoryBubble.js** - Interactive category filtering
- Animated bubble interface for category selection
- Hover and tap animations using Framer Motion
- Visual feedback for active filters

**ThemeContext.js** - Theme management system
- Light/dark theme support
- System preference detection
- LocalStorage persistence
- Theme switching functionality

## Backend Architecture (Node.js/Express)

### API Endpoints

**GET /api/todos** - Retrieve todos with advanced filtering
- Query parameters: search, category, priority, sortBy, sortOrder
- Supports partial text search in titles
- Category and priority filtering
- Multiple sorting options (created_at, title, category, priority, due_date, completed)
- Returns overdue status for each todo

**POST /api/todos** - Create new todo
- Required: title
- Optional: category, priority, dueDate
- Input validation for all fields
- Due date validation (cannot be in the past)
- Priority validation (Low, Medium, High only)

**PUT /api/todos/:id** - Update existing todo
- Supports partial updates (title, category, priority, completed, dueDate)
- Individual endpoint for title-only updates (PUT /api/todos/:id/title)
- Comprehensive validation for all updatable fields
- Automatic timestamp updates

**DELETE /api/todos/:id** - Delete todo
- Removes todo by ID
- Returns success/error status

**GET /api/health** - Health check endpoint
- Returns API status for monitoring

### Database Layer

**SQLite Database** with the following schema:
```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT DEFAULT "General",
  priority TEXT DEFAULT "Medium",
  completed BOOLEAN DEFAULT 0,
  due_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Database Features:**
- Automatic table creation and migration support
- Column addition for backward compatibility
- Index on due_date for efficient overdue queries
- Timestamp management for audit trails

## State Management

### Frontend State
- **React useState** for component-level state
- **useEffect** for side effects and API calls
- **Context API** for theme management
- **Prop drilling** for todo operations (add, update, delete)

### Backend State
- **SQLite database** for persistent storage
- **In-memory** todo objects during request processing
- **No external state management** (stateless API design)

## Integration Points

### API Communication
- **Axios** library for HTTP requests
- **RESTful** API design
- **Error handling** with user-friendly messages
- **Loading states** for better UX

### Data Flow
1. User interacts with React components
2. Components make API calls via Axios
3. Express server processes requests
4. SQLite database stores/retrieves data
5. Response flows back through the same path
6. UI updates based on new data

## Security Considerations

- **Input validation** on all API endpoints
- **CORS** configuration for cross-origin requests
- **SQL injection prevention** through parameterized queries
- **No authentication** currently implemented (local development)

## Performance Optimizations

- **Database indexing** on frequently queried columns
- **Efficient queries** with specific SELECT fields
- **Client-side caching** of todo data
- **Debounced search** to reduce API calls
- **Pagination** not implemented (suitable for personal use)

## Animation & UX Enhancements

- **Framer Motion** for smooth animations
- **Spring animations** for natural feel
- **Hover effects** and visual feedback
- **Loading states** and skeleton screens
- **Confetti celebration** for task completion
- **Responsive design** for mobile compatibility

## Development Architecture

### Project Structure
```
expensio/
├── backend/
│   ├── server.js      # Express server and API routes
│   ├── database.js    # SQLite database configuration
│   └── package.json   # Backend dependencies
└── frontend/
    ├── src/
    │   ├── App.js              # Main React component
    │   ├── TodoForm.js         # Todo creation modal
    │   ├── TodoList.js         # Todo list container
    │   ├── TodoItem.js         # Individual todo component
    │   ├── ProgressBar.js      # Progress tracking with confetti
    │   ├── CategoryBubble.js   # Category filter UI
    │   ├── ThemeContext.js     # Theme management
    │   └── App.css            # Styling
    └── package.json           # Frontend dependencies
```

This architecture provides a solid foundation for a feature-rich todo application with room for future enhancements like user authentication, real-time updates, and mobile applications.
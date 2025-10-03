# TODO List App

A full-stack TODO list application built with React (frontend) and Node.js/Express (backend) with SQLite database persistence.

## Features

- ✅ Add new todos
- ✅ List all todos
- ✅ Mark todos as completed/undone
- ✅ Delete todos
- ✅ Clean, responsive UI
- ✅ Persistent storage with SQLite
- ✅ RESTful API

## Project Structure

```
expensio/
├── backend/
│   ├── database.js      # SQLite database setup
│   ├── server.js        # Express server with API routes
│   └── package.json     # Backend dependencies
└── frontend/
    ├── public/
    │   └── index.html   # React HTML template
    └── src/
        ├── App.js       # Main React component
        ├── App.css      # Styling
        ├── TodoForm.js  # Form for adding todos
        ├── TodoList.js  # List container component
        ├── TodoItem.js  # Individual todo item
        ├── index.js     # React entry point
        └── package.json # Frontend dependencies
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd expensio/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`

   API endpoints available:
   - `GET /api/todos` - Get all todos
   - `POST /api/todos` - Create a new todo
   - `PUT /api/todos/:id` - Update a todo
   - `DELETE /api/todos/:id` - Delete a todo
   - `GET /api/health` - Health check

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd expensio/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## Usage

1. Make sure both backend (port 5000) and frontend (port 3000) are running
2. Open your browser and go to `http://localhost:3000`
3. Start adding todos using the form at the top
4. Mark todos as complete by clicking the "Complete" button
5. Delete todos by clicking the "Delete" button
6. Use "Undo" to mark completed todos as incomplete again

## Development

### Backend Development

- The server uses Express.js with CORS enabled
- SQLite database for data persistence
- API routes handle all CRUD operations
- Database file (`todos.db`) is created automatically

### Frontend Development

- Built with React functional components and hooks
- Uses Axios for API communication
- Responsive design with CSS
- Error handling for API failures

## Troubleshooting

**Backend not starting?**
- Make sure port 5000 is available
- Check that all dependencies are installed: `npm install` in the backend folder

**Frontend can't connect to backend?**
- Ensure the backend is running on port 5000
- Check that CORS is properly configured (it should be by default)

**Database issues?**
- The SQLite database file `todos.db` is created automatically in the backend folder
- If you need to reset the database, delete the `todos.db` file and restart the backend

## Technologies Used

- **Backend**: Node.js, Express.js, SQLite3, CORS
- **Frontend**: React, Axios, CSS3
- **Database**: SQLite

## License

ISC
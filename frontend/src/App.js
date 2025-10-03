import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import './App.css';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/todos');
      setTodos(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to fetch todos. Please make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // Load todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Handle new todo added
  const handleTodoAdded = (newTodo) => {
    setTodos([newTodo, ...todos]);
  };

  // Handle todo updated
  const handleTodoUpdated = (updatedTodo) => {
    setTodos(todos.map(todo =>
      todo.id === updatedTodo.id ? updatedTodo : todo
    ));
  };

  // Handle todo deleted
  const handleTodoDeleted = (deletedTodoId) => {
    setTodos(todos.filter(todo => todo.id !== deletedTodoId));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>TODO List App</h1>
        <p>A simple todo application built with React and Node.js</p>
      </header>

      <main className="app-main">
        <TodoForm onTodoAdded={handleTodoAdded} />

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchTodos} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <p>Loading todos...</p>
          </div>
        ) : (
          <TodoList
            todos={todos}
            onTodoUpdated={handleTodoUpdated}
            onTodoDeleted={handleTodoDeleted}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Built with React, Node.js, Express, and SQLite</p>
      </footer>
    </div>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import './App.css';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch todos from backend
  const fetchTodos = async (search = '', category = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const url = `http://localhost:5000/api/todos${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axios.get(url);
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

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchTodos(value, categoryFilter);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (e) => {
    const value = e.target.value;
    setCategoryFilter(value);
    fetchTodos(searchTerm, value);
  };

  // Get unique categories for filter dropdown
  const getUniqueCategories = () => {
    const categories = todos.map(todo => todo.category || 'General');
    return ['All', ...new Set(categories)];
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    fetchTodos('', '');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>TODO List App</h1>
        <p>A simple todo application built with React and Node.js</p>
      </header>

      <div className="search-filter-container">
        <div className="search-filter">
          <div className="search-group">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search todos..."
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              className="category-filter"
            >
              <option value="">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category === 'All' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || categoryFilter) && (
            <button onClick={clearFilters} className="clear-filters-button">
              Clear Filters
            </button>
          )}
        </div>
      </div>

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
import React, { useState } from 'react';
import axios from 'axios';

const TodoForm = ({ onTodoAdded }) => {
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('📋 General');
  const [priority, setPriority] = useState('Medium');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Predefined categories with emojis
  const predefinedCategories = [
    '📋 General',
    '💼 Work',
    '👤 Personal',
    '🛒 Shopping',
    '🏥 Health',
    '💰 Finance',
    '📚 Education',
    '✈️ Travel',
    '🏠 Home',
    '🚨 Urgent'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/todos', {
        title: title.trim(),
        category: selectedCategory,
        priority: priority,
        dueDate: hasDueDate && dueDate ? dueDate.toISOString().split('T')[0] : null
      });

      onTodoAdded(response.data);
      setTitle('');
      setSelectedCategory('📋 General');
      setPriority('Medium');
      setHasDueDate(false);
      setDueDate(null);
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Failed to add todo. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="todo-form-container">
      <h2>Add New Todo</h2>
      <form onSubmit={handleSubmit} className="todo-form">
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter todo title..."
              className="todo-input"
              disabled={loading}
              aria-label="Todo title"
              aria-required="true"
              aria-describedby="title-help"
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
              disabled={loading}
              aria-label="Select todo category"
            >
              {predefinedCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="priority-select"
              disabled={loading}
              aria-label="Select todo priority"
            >
              <option value="Low">🔵 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🔴 High</option>
            </select>
          </div>
          <button
            type="submit"
            className="add-button"
            disabled={loading || !title.trim()}
            aria-label={loading ? 'Adding todo...' : 'Add new todo'}
          >
            {loading ? 'Adding...' : 'Add Todo'}
          </button>
        </div>
        <div className="due-date-row">
          <div className="due-date-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={hasDueDate}
                onChange={(e) => setHasDueDate(e.target.checked)}
                disabled={loading}
                className="due-date-checkbox"
                aria-label="Set due date for todo"
              />
              Has Due Date
            </label>
          </div>
          {hasDueDate && (
            <div className="date-picker-section">
              <input
                type="date"
                value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : null)}
                className="todo-input"
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
                aria-label="Select todo due date"
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default TodoForm;
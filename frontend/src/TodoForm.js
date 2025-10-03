import React, { useState } from 'react';
import axios from 'axios';

const TodoForm = ({ onTodoAdded }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/todos', {
        title: title.trim(),
        category: category.trim(),
        priority: priority
      });

      onTodoAdded(response.data);
      setTitle('');
      setCategory('General');
      setPriority('Medium');
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
        <div className="form-group">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo title..."
            className="todo-input"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter category (e.g., Work, Personal, Shopping)..."
            className="todo-input"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="priority-select"
            disabled={loading}
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
        >
          {loading ? 'Adding...' : 'Add Todo'}
        </button>
      </form>
    </div>
  );
};

export default TodoForm;
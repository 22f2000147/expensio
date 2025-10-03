import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TodoForm = ({ onTodoAdded }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Medium');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(null);
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
        priority: priority,
        dueDate: hasDueDate && dueDate ? dueDate.toISOString().split('T')[0] : null
      });

      onTodoAdded(response.data);
      setTitle('');
      setCategory('General');
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
              />
              Has Due Date
            </label>
          </div>
          {hasDueDate && (
            <div className="date-picker-section">
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select due date"
                minDate={new Date()}
                className="date-picker"
                disabled={loading}
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default TodoForm;
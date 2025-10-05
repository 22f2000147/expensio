import React, { useState } from 'react';
import axios from 'axios';

const TodoItem = ({ todo, onTodoUpdated, onTodoDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editCategory, setEditCategory] = useState(todo.category || '📋 General');
  const [editPriority, setEditPriority] = useState(todo.priority || 'Medium');
  const [editDueDate, setEditDueDate] = useState(todo.due_date || '');

  // Predefined categories with emojis (same as TodoForm)
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

  // Get emoji for category display
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'General': '📋',
      'Work': '💼',
      'Personal': '👤',
      'Shopping': '🛒',
      'Health': '🏥',
      'Finance': '💰',
      'Education': '📚',
      'Travel': '✈️',
      'Home': '🏠',
      'Urgent': '🚨'
    };
    return emojiMap[category] || '📋';
  };
  // Normalize category string by removing emoji/punctuation (simple ASCII-safe)
  const normalizeCategory = (cat) => {
    if (!cat) return 'general';
    // Strip non-alphanumeric ASCII characters (keeps spaces)
    return String(cat).replace(/[^a-zA-Z0-9\s]/g, '').trim().toLowerCase() || 'general';
  };

  // Simple deterministic hash -> HSL color generator for category
  const categoryColors = (cat) => {
    const key = normalizeCategory(cat);
    // djb2
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) + hash) + key.charCodeAt(i); /* hash * 33 + c */
      hash = hash & hash;
    }
    const hue = Math.abs(hash) % 360;
    // pastel background, medium border, darker text
    const bg = `hsl(${hue}, 70%, 92%)`;
    const border = `hsl(${hue}, 60%, 76%)`;
    const color = `hsl(${hue}, 55%, 28%)`;
    return { bg, border, color };
  };
  const handleToggleComplete = async () => {
    // If currently editing, cancel the edit session first
    if (isEditing) {
      handleCancel();
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/todos/${todo.id}`, {
        completed: !todo.completed
      });

      onTodoUpdated(response.data);
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Failed to update todo. Please make sure the backend is running.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await axios.delete(`http://localhost:5000/api/todos/${todo.id}`);
        onTodoDeleted(todo.id);
      } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo. Please make sure the backend is running.');
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(todo.title);
    setEditCategory(todo.category || '📋 General');
    setEditPriority(todo.priority || 'Medium');
    setEditDueDate(todo.due_date || '');
  };

  const validateForm = () => {
    if (!editTitle.trim()) {
      alert('Title cannot be empty');
      return false;
    }

    // Validate due date if provided
    if (editDueDate) {
      const dueDateObj = new Date(editDueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(dueDateObj.getTime())) {
        alert('Invalid due date format. Please use YYYY-MM-DD format.');
        return false;
      }

      if (dueDateObj < today) {
        alert('Due date cannot be in the past.');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {
        title: editTitle.trim(),
        category: editCategory,
        priority: editPriority,
        dueDate: editDueDate || null
      };

      const response = await axios.put(`http://localhost:5000/api/todos/${todo.id}`, updateData);

      onTodoUpdated(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Failed to update todo. Please make sure the backend is running.');
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditCategory(todo.category || '📋 General');
    setEditPriority(todo.priority || 'Medium');
    setEditDueDate(todo.due_date || '');
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.is_overdue ? 'overdue' : ''}`}>
      <div className="todo-content">
        {isEditing ? (
          <>
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="todo-input"
                    placeholder="Todo title..."
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="category-edit-select"
                    onKeyDown={handleKeyPress}
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
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="priority-select"
                  >
                    <option value="Low">🔵 Low</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="High">🔴 High</option>
                  </select>
                </div>
              </div>
              <div className="due-date-row">
                <div className="form-group">
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="todo-input"
                    placeholder="Due date (optional)"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <span className="todo-title">{todo.title}</span>
            <div className="todo-category">
              { /* apply category-specific color styling */ }
              {(() => {
                const cat = todo.category || '📋 General';
                const { bg, border, color } = categoryColors(cat);
                return (
                  <span
                    className="category-display"
                    style={{ background: bg, border: `1px solid ${border}`, color: color }}
                  >
                    {cat}
                  </span>
                );
              })()}
            </div>
            <div className="todo-priority">
              <span
                className={`priority-badge priority-${todo.priority?.toLowerCase() || 'medium'}`}
                title={`Priority: ${todo.priority || 'Medium'}`}
              >
                {todo.priority === 'Low' ? '🔵' : todo.priority === 'Medium' ? '🟡' : '🔴'} {todo.priority || 'Medium'}
              </span>
            </div>
            <span className="todo-date">
              Created: {new Date(todo.created_at).toLocaleDateString()}
            </span>
            {todo.due_date && (
              <span className={`todo-due-date ${todo.is_overdue ? 'overdue' : ''}`}>
                Due: {new Date(todo.due_date).toLocaleDateString()}
                {todo.is_overdue && <span className="overdue-badge">OVERDUE</span>}
              </span>
            )}
          </>
        )}
      </div>

      <div className="todo-actions">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="add-button">
              Save
            </button>
            <button onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
          </>
        ) : (
          <>
            {!todo.completed && (
              <button onClick={handleEdit} className="edit-button">
                ✏️
              </button>
            )}
            <button
              onClick={handleToggleComplete}
              className={`toggle-button ${todo.completed ? 'undo' : 'complete'}`}
              title={todo.completed ? 'Mark as incomplete' : 'Mark as completed'}
            >
              {todo.completed ? 'Undo' : 'Complete'}
            </button>
            <button
              onClick={handleDelete}
              className="delete-button"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
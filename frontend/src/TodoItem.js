import React, { useState } from 'react';
import axios from 'axios';

const TodoItem = ({ todo, onTodoUpdated, onTodoDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editCategory, setEditCategory] = useState(todo.category || 'General');
  const [editPriority, setEditPriority] = useState(todo.priority || 'Medium');
  const [editDueDate, setEditDueDate] = useState(todo.due_date || '');
  const handleToggleComplete = async () => {
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
    setEditCategory(todo.category || 'General');
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
        category: editCategory.trim(),
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
    setEditCategory(todo.category || 'General');
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
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="title-edit-input"
                placeholder="Todo title..."
                autoFocus
              />
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                onKeyDown={handleKeyPress}
                className="category-edit-input"
                placeholder="Category..."
              />
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="priority-edit-select"
              >
                <option value="Low">🔵 Low</option>
                <option value="Medium">🟡 Medium</option>
                <option value="High">🔴 High</option>
              </select>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                onKeyDown={handleKeyPress}
                className="date-edit-input"
              />
            </div>
          </>
        ) : (
          <>
            <span className="todo-title">{todo.title}</span>
            <div className="todo-category">
              <span className="category-display">
                📁 {todo.category || 'General'}
              </span>
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
            <button onClick={handleSave} className="save-button">
              Save
            </button>
            <button onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={handleEdit} className="edit-button">
              Edit
            </button>
            <button
              onClick={handleToggleComplete}
              className={`toggle-button ${todo.completed ? 'undo' : 'complete'}`}
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
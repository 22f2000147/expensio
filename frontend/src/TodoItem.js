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
            <div className="edit-modal-overlay" onClick={handleCancel}>
              <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="edit-modal-header">
                  <h3>✏️ Edit Todo</h3>
                  <button onClick={handleCancel} className="edit-modal-close" title="Cancel editing">×</button>
                </div>
                <div className="edit-modal-body">
                  <div className="edit-form-group">
                    <label className="edit-form-label">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="edit-modal-input"
                      placeholder="Enter todo title..."
                      autoFocus
                    />
                  </div>
                  <div className="edit-form-group">
                    <label className="edit-form-label">Category</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="edit-modal-input"
                      placeholder="Enter category..."
                    />
                  </div>
                  <div className="edit-form-group">
                    <label className="edit-form-label">Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="edit-modal-select"
                    >
                      <option value="Low">🔵 Low</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="High">🔴 High</option>
                    </select>
                  </div>
                  <div className="edit-form-group">
                    <label className="edit-form-label">Due Date (Optional)</label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="edit-modal-input edit-modal-date"
                    />
                  </div>
                </div>
                <div className="edit-modal-footer">
                  <button onClick={handleCancel} className="edit-modal-cancel" title="Cancel editing">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="edit-modal-save" title="Save changes">
                    Save Changes
                  </button>
                </div>
              </div>
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
            <button onClick={handleSave} className="emoji-button save-button" title="Save changes">
              💾
            </button>
            <button onClick={handleCancel} className="emoji-button cancel-button" title="Cancel editing">
              ❌
            </button>
          </>
        ) : (
          <>
            {!todo.completed && (
              <button onClick={handleEdit} className="emoji-button edit-button" title="Edit todo">
                ✏️
              </button>
            )}
            <button
              onClick={handleToggleComplete}
              className={`emoji-button toggle-button ${todo.completed ? 'undo' : 'complete'}`}
              title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {todo.completed ? '↩️' : '✔️'}
            </button>
            <button
              onClick={handleDelete}
              className="emoji-button delete-button"
              title="Delete todo"
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
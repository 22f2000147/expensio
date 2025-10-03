import React, { useState } from 'react';
import axios from 'axios';

const TodoItem = ({ todo, onTodoUpdated, onTodoDeleted }) => {
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editCategory, setEditCategory] = useState(todo.category || 'General');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
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

  const handleCategoryEdit = () => {
    setIsEditingCategory(true);
  };

  const handleCategorySave = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/todos/${todo.id}`, {
        category: editCategory.trim()
      });

      onTodoUpdated(response.data);
      setIsEditingCategory(false);
    } catch (error) {
      console.error('Error updating todo category:', error);
      alert('Failed to update todo category. Please make sure the backend is running.');
    }
  };

  const handleCategoryCancel = () => {
    setEditCategory(todo.category || 'General');
    setIsEditingCategory(false);
  };

  const handleCategoryKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCategorySave();
    } else if (e.key === 'Escape') {
      handleCategoryCancel();
    }
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (!editTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/todos/${todo.id}/title`, {
        title: editTitle.trim()
      });

      onTodoUpdated(response.data);
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error updating todo title:', error);
      alert('Failed to update todo title. Please make sure the backend is running.');
    }
  };

  const handleTitleCancel = () => {
    setEditTitle(todo.title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.is_overdue ? 'overdue' : ''}`}>
      <div className="todo-content">
        {isEditingTitle ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleTitleKeyPress}
            className="title-edit-input"
            placeholder="Todo title..."
            autoFocus
          />
        ) : (
          <span
            className="todo-title"
            onClick={handleTitleEdit}
            title="Click to edit title"
          >
            {todo.title}
          </span>
        )}
        <div className="todo-category">
          {isEditingCategory ? (
            <input
              type="text"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              onKeyDown={handleCategoryKeyPress}
              className="category-edit-input"
              placeholder="Category..."
              autoFocus
            />
          ) : (
            <span
              className="category-display"
              onClick={handleCategoryEdit}
              title="Click to edit category"
            >
              📁 {todo.category || 'General'}
            </span>
          )}
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
      </div>

      <div className="todo-actions">
        {isEditingTitle || isEditingCategory ? (
          <>
            <button
              onClick={isEditingTitle ? handleTitleSave : handleCategorySave}
              className="save-button"
            >
              Save
            </button>
            <button
              onClick={isEditingTitle ? handleTitleCancel : handleCategoryCancel}
              className="cancel-button"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
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
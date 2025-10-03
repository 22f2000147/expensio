import React, { useState } from 'react';
import axios from 'axios';

const TodoItem = ({ todo, onTodoUpdated, onTodoDeleted }) => {
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editCategory, setEditCategory] = useState(todo.category || 'General');
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

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <span className="todo-title">{todo.title}</span>
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
        <span className="todo-date">
          {new Date(todo.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="todo-actions">
        {isEditingCategory ? (
          <>
            <button onClick={handleCategorySave} className="save-button">
              Save
            </button>
            <button onClick={handleCategoryCancel} className="cancel-button">
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
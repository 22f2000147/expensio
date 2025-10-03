import React from 'react';
import axios from 'axios';

const TodoItem = ({ todo, onTodoUpdated, onTodoDeleted }) => {
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

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <span className="todo-title">{todo.title}</span>
        <span className="todo-date">
          {new Date(todo.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="todo-actions">
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
      </div>
    </div>
  );
};

export default TodoItem;
import React from 'react';
import TodoItem from './TodoItem';

const TodoList = ({ todos, onTodoUpdated, onTodoDeleted }) => {
  if (todos.length === 0) {
    return (
      <div className="todo-list-empty">
        <p>No todos yet. Add one above to get started!</p>
      </div>
    );
  }

  return (
    <div className="todo-list-container">
      <h2>Your Todos</h2>
      <div className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onTodoUpdated={onTodoUpdated}
            onTodoDeleted={onTodoDeleted}
          />
        ))}
      </div>
    </div>
  );
};

export default TodoList;
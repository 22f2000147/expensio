import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import TodoForm from './TodoForm';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-datepicker
jest.mock('react-datepicker', () => {
  return function MockDatePicker({ selected, onChange, placeholderText, minDate, className }) {
    return (
      <input
        type="date"
        value={selected ? selected.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          const date = e.target.value ? new Date(e.target.value) : null;
          onChange(date);
        }}
        placeholder={placeholderText}
        min={minDate ? minDate.toISOString().split('T')[0] : ''}
        className={className}
        data-testid="date-picker"
      />
    );
  };
});

describe('TodoForm with Due Date', () => {
  const mockOnTodoAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders date picker component', () => {
    render(<TodoForm onTodoAdded={mockOnTodoAdded} />);

    const datePicker = screen.getByTestId('date-picker');
    expect(datePicker).toBeInTheDocument();
    expect(datePicker).toHaveAttribute('type', 'date');
  });

  test('allows selecting a due date', async () => {
    render(<TodoForm onTodoAdded={mockOnTodoAdded} />);

    const datePicker = screen.getByTestId('date-picker');
    const futureDate = '2025-12-31';

    fireEvent.change(datePicker, { target: { value: futureDate } });

    expect(datePicker.value).toBe(futureDate);
  });

  test('submits form with due date', async () => {
    const mockTodo = {
      id: 1,
      title: 'Test Todo',
      category: 'Work',
      priority: 'High',
      due_date: '2025-12-31',
      completed: false,
      is_overdue: false
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockTodo });

    render(<TodoForm onTodoAdded={mockOnTodoAdded} />);

    // Fill in the form
    const titleInput = screen.getByPlaceholderText('Enter todo title...');
    const categoryInput = screen.getByPlaceholderText('Enter category (e.g., Work, Personal, Shopping)...');
    const prioritySelect = screen.getByDisplayValue('🟡 Medium');
    const datePicker = screen.getByTestId('date-picker');
    const submitButton = screen.getByText('Add Todo');

    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
    fireEvent.change(categoryInput, { target: { value: 'Work' } });
    fireEvent.change(prioritySelect, { target: { value: 'High' } });
    fireEvent.change(datePicker, { target: { value: '2025-12-31' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:5000/api/todos', {
        title: 'Test Todo',
        category: 'Work',
        priority: 'High',
        dueDate: '2025-12-31'
      });
    });

    expect(mockOnTodoAdded).toHaveBeenCalledWith(mockTodo);
  });

  test('submits form without due date', async () => {
    const mockTodo = {
      id: 2,
      title: 'Test Todo Without Due Date',
      category: 'Personal',
      priority: 'Medium',
      due_date: null,
      completed: false,
      is_overdue: false
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockTodo });

    render(<TodoForm onTodoAdded={mockOnTodoAdded} />);

    // Fill in the form without setting a due date
    const titleInput = screen.getByPlaceholderText('Enter todo title...');
    const categoryInput = screen.getByPlaceholderText('Enter category (e.g., Work, Personal, Shopping)...');
    const submitButton = screen.getByText('Add Todo');

    fireEvent.change(titleInput, { target: { value: 'Test Todo Without Due Date' } });
    fireEvent.change(categoryInput, { target: { value: 'Personal' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:5000/api/todos', {
        title: 'Test Todo Without Due Date',
        category: 'Personal',
        priority: 'Medium',
        dueDate: null
      });
    });
  });

  test('resets form after successful submission', async () => {
    const mockTodo = {
      id: 3,
      title: 'Reset Test Todo',
      category: 'General',
      priority: 'Medium',
      due_date: null,
      completed: false,
      is_overdue: false
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockTodo });

    render(<TodoForm onTodoAdded={mockOnTodoAdded} />);

    const titleInput = screen.getByPlaceholderText('Enter todo title...');
    const categoryInput = screen.getByPlaceholderText('Enter category (e.g., Work, Personal, Shopping)...');
    const prioritySelect = screen.getByDisplayValue('🟡 Medium');
    const datePicker = screen.getByTestId('date-picker');
    const submitButton = screen.getByText('Add Todo');

    // Fill and submit form
    fireEvent.change(titleInput, { target: { value: 'Reset Test Todo' } });
    fireEvent.change(categoryInput, { target: { value: 'Work' } });
    fireEvent.change(prioritySelect, { target: { value: 'High' } });
    fireEvent.change(datePicker, { target: { value: '2025-12-31' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnTodoAdded).toHaveBeenCalledWith(mockTodo);
    });

    // Check that form is reset
    expect(titleInput.value).toBe('');
    expect(categoryInput.value).toBe('General');
    expect(prioritySelect.value).toBe('Medium');
    expect(datePicker.value).toBe('');
  });

  test('shows loading state during submission', async () => {
    // Create a promise that we can control
    let resolvePromise;
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockedAxios.post.mockReturnValueOnce(mockPromise);

    render(<TodoForm onTodoAdded={mockOnTodoAdded} />);

    const titleInput = screen.getByPlaceholderText('Enter todo title...');
    const submitButton = screen.getByText('Add Todo');

    fireEvent.change(titleInput, { target: { value: 'Loading Test' } });
    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolve the promise
    resolvePromise({ data: { id: 4, title: 'Loading Test' } });

    await waitFor(() => {
      expect(screen.getByText('Add Todo')).toBeInTheDocument();
    });
  });
});
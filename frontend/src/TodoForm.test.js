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

// Mock Date.now for consistent testing
const mockDate = new Date('2024-01-15T10:00:00.000Z');
jest.spyOn(global, 'Date').mockImplementation((...args) => {
  if (args.length === 0) {
    return mockDate;
  }
  return new (global.Date.bind.apply(global.Date, [null, ...args]))();
});

describe('TodoForm with Due Date', () => {
  const mockOnTodoAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders due date select dropdown', () => {
    render(<TodoForm onTodoAdded={mockOnTodoAdded} />);

    const dueDateSelect = screen.getByDisplayValue('No Due Date');
    expect(dueDateSelect).toBeInTheDocument();
  });

  test('does not render date picker by default', () => {
    render(<TodoForm onTodoAdded={mockOnTodoAdded} />);

    const datePicker = screen.queryByTestId('date-picker');
    expect(datePicker).not.toBeInTheDocument();
  });

  test('renders date picker when Custom is selected', () => {
    render(<TodoForm onTodoAdded={mockOnTodoAdded} />);

    const dueDateSelect = screen.getByDisplayValue('No Due Date');
    fireEvent.change(dueDateSelect, { target: { value: 'Custom' } });

    const datePicker = screen.getByTestId('date-picker');
    expect(datePicker).toBeInTheDocument();
  });

  test('allows selecting a due date', async () => {
    render(<TodoForm onTodoAdded={mockOnTodoAdded} />);

    const datePicker = screen.getByTestId('date-picker');
    const futureDate = '2025-12-31';

    fireEvent.change(datePicker, { target: { value: futureDate } });

    expect(datePicker.value).toBe(futureDate);
  });

  test('submits form with Today due date', async () => {
    const mockTodo = {
      id: 1,
      title: 'Test Todo Today',
      category: 'Work',
      priority: 'High',
      due_date: '2024-01-15',
      completed: false,
      is_overdue: false
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockTodo });

    render(<TodoForm onTodoAdded={mockOnTodoAdded} />);

    // Fill in the form
    const titleInput = screen.getByPlaceholderText('Enter todo title...');
    const categoryInput = screen.getByPlaceholderText('Enter category (e.g., Work, Personal, Shopping)...');
    const prioritySelect = screen.getByDisplayValue('🟡 Medium');
    const dueDateSelect = screen.getByDisplayValue('No Due Date');
    const submitButton = screen.getByText('Add Todo');

    fireEvent.change(titleInput, { target: { value: 'Test Todo Today' } });
    fireEvent.change(categoryInput, { target: { value: 'Work' } });
    fireEvent.change(prioritySelect, { target: { value: 'High' } });
    fireEvent.change(dueDateSelect, { target: { value: 'Today' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:5000/api/todos', {
        title: 'Test Todo Today',
        category: 'Work',
        priority: 'High',
        dueDate: '2024-01-15'
      });
    });

    expect(mockOnTodoAdded).toHaveBeenCalledWith(mockTodo);
  });

  test('submits form with Custom due date', async () => {
    const mockTodo = {
      id: 2,
      title: 'Test Todo Custom',
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
    const dueDateSelect = screen.getByDisplayValue('No Due Date');
    const datePicker = screen.getByTestId('date-picker');
    const submitButton = screen.getByText('Add Todo');

    fireEvent.change(titleInput, { target: { value: 'Test Todo Custom' } });
    fireEvent.change(categoryInput, { target: { value: 'Work' } });
    fireEvent.change(prioritySelect, { target: { value: 'High' } });
    fireEvent.change(dueDateSelect, { target: { value: 'Custom' } });
    fireEvent.change(datePicker, { target: { value: '2025-12-31' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:5000/api/todos', {
        title: 'Test Todo Custom',
        category: 'Work',
        priority: 'High',
        dueDate: '2025-12-31'
      });
    });

    expect(mockOnTodoAdded).toHaveBeenCalledWith(mockTodo);
  });

  test('submits form without due date (None selected)', async () => {
    const mockTodo = {
      id: 4,
      title: 'Test Todo No Due Date',
      category: 'Personal',
      priority: 'Low',
      due_date: null,
      completed: false,
      is_overdue: false
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockTodo });

    render(<TodoForm onTodoAdded={mockOnTodoAdded} />);

    // Fill in the form with None selected for due date
    const titleInput = screen.getByPlaceholderText('Enter todo title...');
    const categoryInput = screen.getByPlaceholderText('Enter category (e.g., Work, Personal, Shopping)...');
    const prioritySelect = screen.getByDisplayValue('🟡 Medium');
    const dueDateSelect = screen.getByDisplayValue('No Due Date');
    const submitButton = screen.getByText('Add Todo');

    fireEvent.change(titleInput, { target: { value: 'Test Todo No Due Date' } });
    fireEvent.change(categoryInput, { target: { value: 'Personal' } });
    fireEvent.change(prioritySelect, { target: { value: 'Low' } });
    // dueDateSelect is already set to 'None' by default

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:5000/api/todos', {
        title: 'Test Todo No Due Date',
        category: 'Personal',
        priority: 'Low',
        dueDate: null
      });
    });
  });

  test('resets form after successful submission', async () => {
    const mockTodo = {
      id: 5,
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
    const dueDateSelect = screen.getByDisplayValue('No Due Date');
    const submitButton = screen.getByText('Add Todo');

    // Fill and submit form
    fireEvent.change(titleInput, { target: { value: 'Reset Test Todo' } });
    fireEvent.change(categoryInput, { target: { value: 'Work' } });
    fireEvent.change(prioritySelect, { target: { value: 'High' } });
    fireEvent.change(dueDateSelect, { target: { value: 'Today' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnTodoAdded).toHaveBeenCalledWith(mockTodo);
    });

    // Check that form is reset
    expect(titleInput.value).toBe('');
    expect(categoryInput.value).toBe('General');
    expect(prioritySelect.value).toBe('Medium');
    expect(dueDateSelect.value).toBe('None');
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
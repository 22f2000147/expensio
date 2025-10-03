import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DatePickerModal = ({
  selectedDate,
  onDateSelect,
  placeholder = "Select date",
  minDate = new Date(),
  maxDate = null,
  disabled = false,
  label = "Date",
  className = "",
  showTimeSelect = false,
  dateFormat = "yyyy-MM-dd"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(selectedDate);
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  // Update temp date when selected date changes - use useMemo for performance
  useEffect(() => {
    setTempDate(selectedDate);
  }, [selectedDate]);

  // Memoize click outside handler to prevent unnecessary re-renders
  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target) &&
        triggerRef.current && !triggerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  // Close modal when clicking outside - optimized effect
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  // Handle date selection
  const handleDateChange = (date) => {
    setTempDate(date);
  };

  // Handle confirm selection
  const handleConfirm = () => {
    onDateSelect(tempDate);
    setIsOpen(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setTempDate(selectedDate); // Reset to original date
    setIsOpen(false);
  };

  // Format date for display - memoized for performance
  const formatDisplayDate = useCallback((date) => {
    if (!date) return placeholder;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }, [placeholder]);

  // Memoize display date to prevent unnecessary recalculations
  const displayDate = useMemo(() => formatDisplayDate(selectedDate), [selectedDate, formatDisplayDate]);

  return (
    <div className={`date-picker-modal-container ${className}`}>
      {label && (
        <label className="date-picker-label">
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        className={`date-picker-trigger ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label={`${label || 'Date'} selector`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="date-picker-value">
          {displayDate}
        </span>
        <span className="date-picker-icon">
          📅
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="date-picker-backdrop"
            onClick={handleCancel}
            aria-label="Close date picker"
          />

          {/* Modal */}
          <div
            ref={modalRef}
            className="date-picker-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="date-picker-title"
          >
            <div className="date-picker-header">
              <h3 id="date-picker-title" className="date-picker-title">
                {label || 'Select Date'}
              </h3>
              <button
                type="button"
                className="date-picker-close"
                onClick={handleCancel}
                aria-label="Close date picker"
              >
                ×
              </button>
            </div>

            <div className="date-picker-body">
              <DatePicker
                selected={tempDate}
                onChange={handleDateChange}
                inline
                minDate={minDate}
                maxDate={maxDate}
                showTimeSelect={showTimeSelect}
                dateFormat={dateFormat}
                calendarClassName="custom-calendar"
                disabled={disabled}
              />
            </div>

            <div className="date-picker-footer">
              <button
                type="button"
                className="date-picker-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="date-picker-confirm"
                onClick={handleConfirm}
              >
                Select Date
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DatePickerModal;
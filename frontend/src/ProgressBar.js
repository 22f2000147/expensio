import React, { useState, useEffect } from 'react';
import './ProgressBar.css';

const ProgressBar = ({ todos }) => {
  console.log('ProgressBar component rendering with todos:', todos);
  const [showConfetti, setShowConfetti] = useState(false);
  const [progress, setProgress] = useState(0);

  // Calculate progress percentage
  const calculateProgress = () => {
    if (todos.length === 0) return 0;
    const completedTasks = todos.filter(todo => todo.completed).length;
    return Math.round((completedTasks / todos.length) * 100);
  };

  // Update progress when todos change
  useEffect(() => {
    const newProgress = calculateProgress();
    console.log('ProgressBar Debug:', {
      todosCount: todos.length,
      completedCount: todos.filter(todo => todo.completed).length,
      newProgress,
      todos
    });
    setProgress(newProgress);

    // Trigger confetti animation when reaching 100%
    if (newProgress === 100 && todos.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [todos]);

  // Generate confetti particles
  const renderConfetti = () => {
    if (!showConfetti) return null;

    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push(
        <div
          key={i}
          className="confetti-particle"
          style={{
            '--delay': `${Math.random() * 3}s`,
            '--rotation': `${Math.random() * 360}deg`,
            '--x-offset': `${(Math.random() - 0.5) * 100}px`,
            backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'][Math.floor(Math.random() * 6)]
          }}
        />
      );
    }
    return particles;
  };

  // Determine emoji animation class
  const getEmojiClass = () => {
    if (progress === 100) return 'emoji-glow';
    if (progress > 0) return 'emoji-pulse';
    return '';
  };

  return (
    <>
      {/* Debug: Always show progress bar for testing */}
      <div className="progress-bar-container" role="progressbar" aria-label={`Task completion progress: ${progress}% complete`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} style={{ backgroundColor: 'red', opacity: 0.8 }}>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={`progress-emoji ${getEmojiClass()}`}>
          {progress === 100 ? '🎉' : progress > 0 ? '🎉' : ''}
        </div>
      </div>
      {showConfetti && (
        <div className="confetti-container">
          {renderConfetti()}
        </div>
      )}
    </>
  );
};

export default ProgressBar;
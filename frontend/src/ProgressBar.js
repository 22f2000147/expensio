import React, { useState, useEffect } from 'react';
import './ProgressBar.css';

const ProgressBar = ({ todos }) => {
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
    setProgress(newProgress);

    // Trigger confetti animation when reaching 100%
    if (newProgress === 100 && todos.length > 0) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
  }, [todos]);

  // Generate confetti particles
  const renderConfetti = () => {
    if (!showConfetti) return null;

    const particles = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];

    for (let i = 0; i < 20; i++) {
      // Create very tightly controlled x-offsets that stay within todo section boundaries
      const xOffset = (Math.random() - 0.5) * 60; // Maximum containment within todo section

      particles.push(
        <div
          key={i}
          className="confetti-particle"
          style={{
            '--delay': `${Math.random() * 0.8}s`,
            '--rotation': `${Math.random() * 360}deg`,
            '--x-offset': `${xOffset}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)]
          }}
        />
      );
    }
    return particles;
  };

  return (
    <>
       <div className="progress-bar-container" role="progressbar" aria-label={`Task completion progress: ${progress}% complete`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
         <div className="progress-bar">
           <div
             className="progress-fill"
             style={{ width: `${progress}%` }}
           />
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
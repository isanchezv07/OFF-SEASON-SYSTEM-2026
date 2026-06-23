import { useEffect, useRef } from 'react';

interface SequenceStep {
  action: () => void;
  duration: number;
}

const useAnimationSequence = (sequence: SequenceStep[]) => {
  const sequenceRunningRef = useRef(false);
  
  useEffect(() => {
    // Avoid re-running the sequence if it's already in progress
    if (sequenceRunningRef.current) return;
    sequenceRunningRef.current = true;
    
    let totalDelay = 0;
    
    // Execute each step with its appropriate delay
    sequence.forEach((step, index) => {
      const timer = setTimeout(() => {
        step.action();
      }, totalDelay);
      
      totalDelay += step.duration;
      
      // Clean up timer if component unmounts
      return () => clearTimeout(timer);
    });
    
    // Reset the sequence running flag when completed
    const completionTimer = setTimeout(() => {
      sequenceRunningRef.current = false;
    }, totalDelay);
    
    return () => clearTimeout(completionTimer);
  }, [sequence]);
};

export default useAnimationSequence;
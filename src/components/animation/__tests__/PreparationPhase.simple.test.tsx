import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { PreparationPhase } from '../PreparationPhase';

describe('PreparationPhase - Timer Fix Validation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should only call onComplete once even when props change', () => {
    const mockOnComplete1 = vi.fn();
    const mockOnComplete2 = vi.fn();

    const { rerender } = render(<PreparationPhase onComplete={mockOnComplete1} />);

    // Initially shows 3
    expect(screen.getByText('3')).toBeInTheDocument();

    // Change onComplete prop (simulating parent re-render that caused the bug)
    rerender(<PreparationPhase onComplete={mockOnComplete2} />);

    // Complete the countdown - need to wait for completion callback
    act(() => {
      vi.advanceTimersByTime(3000); // 3 seconds countdown
    });
    
    act(() => {
      vi.advanceTimersByTime(500); // additional delay for completion
    });

    // Only the current onComplete should be called once (proves fix works)
    expect(mockOnComplete1).not.toHaveBeenCalled();
    expect(mockOnComplete2).toHaveBeenCalledTimes(1);
  });

  it('should display countdown progression correctly', () => {
    const mockOnComplete = vi.fn();
    render(<PreparationPhase onComplete={mockOnComplete} />);

    expect(screen.getByText('3')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('2')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('1')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('開始！')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(500));
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should clean up timers properly on unmount', () => {
    const mockOnComplete = vi.fn();
    const { unmount } = render(<PreparationPhase onComplete={mockOnComplete} />);

    expect(screen.getByText('3')).toBeInTheDocument();

    // Unmount component
    unmount();

    // Timer should be cleaned up, onComplete should not be called
    act(() => vi.advanceTimersByTime(5000));
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});
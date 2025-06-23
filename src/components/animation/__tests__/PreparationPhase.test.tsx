import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { PreparationPhase } from '../PreparationPhase';

describe('PreparationPhase', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should display countdown from 3 to 1', () => {
    const mockOnComplete = vi.fn();
    render(<PreparationPhase onComplete={mockOnComplete} />);

    // Initially shows 3
    expect(screen.getByText('3')).toBeInTheDocument();

    // After 1 second, shows 2
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('2')).toBeInTheDocument();

    // After another 1 second, shows 1
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('1')).toBeInTheDocument();

    // After another 1 second, shows "開始！"
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('開始！')).toBeInTheDocument();

    // After 500ms more, onComplete should be called
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should not create duplicate timers when onComplete changes', () => {
    const mockOnComplete1 = vi.fn();
    const mockOnComplete2 = vi.fn();

    const { rerender } = render(<PreparationPhase onComplete={mockOnComplete1} />);

    // Initial countdown
    expect(screen.getByText('3')).toBeInTheDocument();

    // Change onComplete prop (simulating parent re-render)
    rerender(<PreparationPhase onComplete={mockOnComplete2} />);

    // Advance time and check that countdown still works normally
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('2')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('1')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('開始！')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Only the current onComplete should be called once
    expect(mockOnComplete1).not.toHaveBeenCalled();
    expect(mockOnComplete2).toHaveBeenCalledTimes(1);
  });

  it('should clean up timers on unmount', () => {
    const mockOnComplete = vi.fn();
    const { unmount } = render(<PreparationPhase onComplete={mockOnComplete} />);

    expect(screen.getByText('3')).toBeInTheDocument();

    // Unmount before completion
    unmount();

    // Advance time past when onComplete would have been called
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // onComplete should not be called
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('should handle rapid prop changes without breaking countdown', () => {
    const mockOnComplete1 = vi.fn();
    const mockOnComplete2 = vi.fn();
    const mockOnComplete3 = vi.fn();

    const { rerender } = render(<PreparationPhase onComplete={mockOnComplete1} />);

    expect(screen.getByText('3')).toBeInTheDocument();

    // Multiple rapid prop changes
    rerender(<PreparationPhase onComplete={mockOnComplete2} />);
    rerender(<PreparationPhase onComplete={mockOnComplete3} />);

    // Countdown should still work normally
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(screen.getByText('開始！')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Only the final onComplete should be called
    expect(mockOnComplete1).not.toHaveBeenCalled();
    expect(mockOnComplete2).not.toHaveBeenCalled();
    expect(mockOnComplete3).toHaveBeenCalledTimes(1);
  });
});
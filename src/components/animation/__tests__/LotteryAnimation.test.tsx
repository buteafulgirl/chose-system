import { render, screen, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { LotteryAnimation } from '../../LotteryAnimation';
import { Participant, Prize } from '../../types/lottery';

const mockParticipants: Participant[] = [
  { id: '1', name: '張三', isSelected: false },
  { id: '2', name: '李四', isSelected: false },
  { id: '3', name: '王五', isSelected: false },
];

const mockPrize: Prize = {
  id: '1',
  name: '特等獎',
  drawCount: 1,
};

describe('LotteryAnimation Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should complete full animation sequence without duplicate phases', () => {
    const mockOnComplete = vi.fn();
    const mockOnPhaseChange = vi.fn();

    render(
      <LotteryAnimation
        isVisible={true}
        participants={mockParticipants}
        prize={mockPrize}
        onComplete={mockOnComplete}
        onPhaseChange={mockOnPhaseChange}
      />
    );

    // Should start with preparation phase
    expect(mockOnPhaseChange).toHaveBeenCalledWith('preparing');
    expect(screen.getByText('3')).toBeInTheDocument();

    // Advance through preparation countdown (1 second at a time)
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
    
    // Now advance the final 500ms to trigger onComplete
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Now we should be in activating phase
    expect(mockOnPhaseChange).toHaveBeenCalledWith('activating');

    // Advance through activation phase (2 seconds)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(mockOnPhaseChange).toHaveBeenCalledWith('shuffling');

    // Advance through shuffling phase (4 seconds for small participant count)
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(mockOnPhaseChange).toHaveBeenCalledWith('revealing');

    // Advance through revelation phase (1000ms for first winner + 2000ms completion = 3000ms)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(mockOnPhaseChange).toHaveBeenCalledWith('celebrating');

    // Advance through celebration phase (3 seconds)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(mockOnPhaseChange).toHaveBeenCalledWith('idle');
    expect(mockOnComplete).toHaveBeenCalledTimes(1);

    // Verify the sequence was called correctly
    const phases = mockOnPhaseChange.mock.calls.map(call => call[0]);
    expect(phases).toEqual(['preparing', 'activating', 'shuffling', 'revealing', 'celebrating', 'idle']);
  });

  it('should not restart animation when props change during animation', () => {
    const mockOnComplete = vi.fn();
    const mockOnPhaseChange = vi.fn();

    const { rerender } = render(
      <LotteryAnimation
        isVisible={true}
        participants={mockParticipants}
        prize={mockPrize}
        onComplete={mockOnComplete}
        onPhaseChange={mockOnPhaseChange}
      />
    );

    // Start preparation phase
    expect(mockOnPhaseChange).toHaveBeenCalledWith('preparing');
    expect(screen.getByText('3')).toBeInTheDocument();

    // Advance halfway through preparation
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText('2')).toBeInTheDocument();

    // Change props (simulate parent re-render)
    rerender(
      <LotteryAnimation
        isVisible={true}
        participants={mockParticipants}
        prize={mockPrize}
        onComplete={mockOnComplete}
        onPhaseChange={mockOnPhaseChange}
      />
    );

    // Should continue from where it left off, not restart
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('1')).toBeInTheDocument();

    // Advance to complete countdown (should show "開始！")
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('開始！')).toBeInTheDocument();
    
    // Now advance the final 500ms to trigger onComplete
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Should now be in activating phase
    expect(mockOnPhaseChange).toHaveBeenCalledWith('activating');
    
    // Complete activating phase (2000ms)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(mockOnPhaseChange).toHaveBeenCalledWith('shuffling');
    
    // Complete shuffling phase (4000ms for small participant count)
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(mockOnPhaseChange).toHaveBeenCalledWith('revealing');
    
    // Complete revealing phase (3000ms)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(mockOnPhaseChange).toHaveBeenCalledWith('celebrating');
    
    // Complete celebrating phase (3000ms)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(mockOnPhaseChange).toHaveBeenCalledWith('idle');

    // Should only complete once
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should reset properly when isVisible changes to false', () => {
    const mockOnComplete = vi.fn();
    const mockOnPhaseChange = vi.fn();

    const { rerender } = render(
      <LotteryAnimation
        isVisible={true}
        participants={mockParticipants}
        prize={mockPrize}
        onComplete={mockOnComplete}
        onPhaseChange={mockOnPhaseChange}
      />
    );

    // Start animation
    expect(mockOnPhaseChange).toHaveBeenCalledWith('preparing');

    // Hide animation
    rerender(
      <LotteryAnimation
        isVisible={false}
        participants={mockParticipants}
        prize={mockPrize}
        onComplete={mockOnComplete}
        onPhaseChange={mockOnPhaseChange}
      />
    );

    // Should not render anything when not visible
    expect(screen.queryByText('3')).not.toBeInTheDocument();

    // Show again
    rerender(
      <LotteryAnimation
        isVisible={true}
        participants={mockParticipants}
        prize={mockPrize}
        onComplete={mockOnComplete}
        onPhaseChange={mockOnPhaseChange}
      />
    );

    // Should restart from preparation
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should handle empty participants gracefully', () => {
    const mockOnComplete = vi.fn();
    const mockOnPhaseChange = vi.fn();

    render(
      <LotteryAnimation
        isVisible={true}
        participants={[]}
        prize={mockPrize}
        onComplete={mockOnComplete}
        onPhaseChange={mockOnPhaseChange}
      />
    );

    // Should not start animation with empty participants
    expect(mockOnPhaseChange).not.toHaveBeenCalled();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });
});
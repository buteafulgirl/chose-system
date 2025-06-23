import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { LotteryWheel } from '../LotteryWheel';
import { Participant, Prize } from '../../types/lottery';

const mockParticipants: Participant[] = [
  { id: '1', name: '張三', isSelected: false },
  { id: '2', name: '李四', isSelected: false },
  { id: '3', name: '王五', isSelected: false },
  { id: '4', name: '趙六', isSelected: false },
  { id: '5', name: '陳七', isSelected: false },
];

const mockPrize: Prize = {
  id: '1',
  name: '特等獎',
  drawCount: 2,
};

describe('LotteryWheel - Timer Fix Validation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should not create duplicate drawing processes when onDrawComplete changes', () => {
    const mockOnDrawComplete1 = vi.fn();
    const mockOnDrawComplete2 = vi.fn();

    const { rerender } = render(
      <LotteryWheel
        participants={mockParticipants}
        isDrawing={true}
        onDrawComplete={mockOnDrawComplete1}
        currentPrize={mockPrize}
        allowRepeat={false}
      />
    );

    // Change onDrawComplete prop (this would cause the original bug)
    rerender(
      <LotteryWheel
        participants={mockParticipants}
        isDrawing={true}
        onDrawComplete={mockOnDrawComplete2}
        currentPrize={mockPrize}
        allowRepeat={false}
      />
    );

    // Complete the drawing animation
    act(() => {
      vi.advanceTimersByTime(3500); // Max duration + buffer
    });

    // Should only call the current onDrawComplete once
    expect(mockOnDrawComplete1).not.toHaveBeenCalled();
    expect(mockOnDrawComplete2).toHaveBeenCalledTimes(1);
    
    const winners = mockOnDrawComplete2.mock.calls[0][0];
    expect(winners).toHaveLength(2); // Should draw 2 winners
  });

  it('should complete drawing within expected timeframe', () => {
    const mockOnDrawComplete = vi.fn();

    render(
      <LotteryWheel
        participants={mockParticipants}
        isDrawing={true}
        onDrawComplete={mockOnDrawComplete}
        currentPrize={mockPrize}
        allowRepeat={false}
      />
    );

    // Drawing should complete within the max duration
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(mockOnDrawComplete).toHaveBeenCalledTimes(1);
  });

  it('should handle insufficient participants with alert', () => {
    const mockOnDrawComplete = vi.fn();
    const fewParticipants = mockParticipants.slice(0, 1); // Only 1 participant
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <LotteryWheel
        participants={fewParticipants}
        isDrawing={true}
        onDrawComplete={mockOnDrawComplete}
        currentPrize={mockPrize} // Needs 2 winners but only 1 participant
        allowRepeat={false}
      />
    );

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('抽獎失敗：特等獎 需要 2 人，僅有 1 人可抽')
    );
    expect(mockOnDrawComplete).toHaveBeenCalledWith([]);

    alertSpy.mockRestore();
  });
});
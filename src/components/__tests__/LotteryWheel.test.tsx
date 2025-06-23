import { render, screen, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
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

describe('LotteryWheel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should not start drawing when isDrawing is false', () => {
    const mockOnDrawComplete = vi.fn();

    render(
      <LotteryWheel
        participants={mockParticipants}
        isDrawing={false}
        onDrawComplete={mockOnDrawComplete}
        currentPrize={mockPrize}
        allowRepeat={false}
      />
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(mockOnDrawComplete).not.toHaveBeenCalled();
  });

  it('should start drawing when isDrawing is true', () => {
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

    // Should show some participant name during animation
    act(() => {
      vi.advanceTimersByTime(100);
    });
    const nameElements = screen.queryAllByText(/張三|李四|王五|趙六|陳七/);
    expect(nameElements.length).toBeGreaterThan(0);

    // Complete the drawing
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(mockOnDrawComplete).toHaveBeenCalledTimes(1);
  });

  it('should not create duplicate drawing processes when props change', () => {
    const mockOnDrawComplete = vi.fn();

    const { rerender } = render(
      <LotteryWheel
        participants={mockParticipants}
        isDrawing={true}
        onDrawComplete={mockOnDrawComplete}
        currentPrize={mockPrize}
        allowRepeat={false}
      />
    );

    // Change props (simulating parent re-render)
    rerender(
      <LotteryWheel
        participants={mockParticipants}
        isDrawing={true}
        onDrawComplete={mockOnDrawComplete}
        currentPrize={mockPrize}
        allowRepeat={true}
      />
    );

    // Complete the drawing
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    // Should only call onDrawComplete once, not multiple times
    expect(mockOnDrawComplete).toHaveBeenCalledTimes(1);
    
    const calls = mockOnDrawComplete.mock.calls;
    expect(calls[0][0]).toHaveLength(2); // Should draw 2 winners as specified
  });

  it('should handle insufficient participants gracefully', () => {
    const mockOnDrawComplete = vi.fn();
    const fewParticipants = mockParticipants.slice(0, 1); // Only 1 participant
    
    // Mock alert
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

  it('should reset state when isDrawing changes to false', () => {
    const mockOnDrawComplete = vi.fn();

    const { rerender } = render(
      <LotteryWheel
        participants={mockParticipants}
        isDrawing={true}
        onDrawComplete={mockOnDrawComplete}
        currentPrize={mockPrize}
        allowRepeat={false}
      />
    );

    // Let it start drawing
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Stop drawing
    rerender(
      <LotteryWheel
        participants={mockParticipants}
        isDrawing={false}
        onDrawComplete={mockOnDrawComplete}
        currentPrize={mockPrize}
        allowRepeat={false}
      />
    );

    // Should not show progressive results when not drawing
    expect(screen.queryByText(/已抽中名單/)).not.toBeInTheDocument();
  });

  it('should handle progressive results for large draw counts', () => {
    const mockOnDrawComplete = vi.fn();
    const largePrize: Prize = {
      id: '2',
      name: '參加獎',
      drawCount: 6, // More than 5, should trigger progressive results
    };

    const moreParticipants = [
      ...mockParticipants,
      { id: '6', name: '孫八', isSelected: false },
      { id: '7', name: '周九', isSelected: false },
    ];

    render(
      <LotteryWheel
        participants={moreParticipants}
        isDrawing={true}
        onDrawComplete={mockOnDrawComplete}
        currentPrize={largePrize}
        allowRepeat={false}
      />
    );

    // Should show progressive results
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText(/已抽中名單/)).toBeInTheDocument();

    // Complete the drawing
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(mockOnDrawComplete).toHaveBeenCalledTimes(1);
    
    const winners = mockOnDrawComplete.mock.calls[0][0];
    expect(winners).toHaveLength(6);
  });
});
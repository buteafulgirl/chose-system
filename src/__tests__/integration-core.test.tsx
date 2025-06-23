import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Simplified mock for LotteryAnimation
vi.mock('../components/LotteryAnimation', () => ({
  LotteryAnimation: ({ onComplete, participants, prize }: any) => {
    setTimeout(() => {
      const selectedWinners = participants.slice(0, prize.drawCount);
      onComplete(selectedWinners);
    }, 50);
    
    return <div data-testid="lottery-animation">抽獎中...</div>;
  }
}));

describe('Core Lottery Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.stubGlobal('alert', vi.fn());
  });

  it('should complete basic lottery flow successfully', async () => {
    render(<App />);

    // 1. Setup phase - add participant
    const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
    await user.type(participantInput, '測試者');
    await user.click(screen.getByText('新增'));

    // Verify participant was added
    expect(screen.getByText('測試者')).toBeInTheDocument();

    // 2. Complete setup
    await user.click(screen.getByText('完成設定'));

    // 3. Overview phase - verify transition
    await waitFor(() => {
      expect(screen.getByText('修改設定')).toBeInTheDocument();
    });

    // 4. Start drawing
    const prizeButtons = screen.getAllByText('開始抽獎');
    await user.click(prizeButtons[0]);

    // 5. Verify animation starts
    await waitFor(() => {
      expect(screen.getByTestId('lottery-animation')).toBeInTheDocument();
    });

    // 6. Wait for results
    await waitFor(() => {
      expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
    }, { timeout: 1000 });

    // 7. Verify winner is displayed
    expect(screen.getByText('測試者')).toBeInTheDocument();
    expect(screen.getByText('回到抽獎總覽')).toBeInTheDocument();
  });

  it('should handle multiple participants correctly', async () => {
    render(<App />);

    // Add multiple participants
    const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
    const names = ['參與者A', '參與者B', '參與者C'];
    
    for (const name of names) {
      await user.type(participantInput, name);
      await user.click(screen.getByText('新增'));
      await user.clear(participantInput);
    }

    // Complete setup
    await user.click(screen.getByText('完成設定'));

    // Start lottery
    await waitFor(() => {
      const prizeButtons = screen.getAllByText('開始抽獎');
      return user.click(prizeButtons[0]);
    });

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
    }, { timeout: 1000 });

    // One of the participants should be the winner
    const winnerElements = screen.getAllByText(/(參與者A|參與者B|參與者C)/);
    expect(winnerElements.length).toBeGreaterThan(0);
  });

  it('should show disabled button for insufficient participants', async () => {
    render(<App />);

    // Add only one participant
    const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
    await user.type(participantInput, '唯一參與者');
    await user.click(screen.getByText('新增'));

    await user.click(screen.getByText('完成設定'));

    // Check that second prize button (needs 2 participants) is disabled
    await waitFor(() => {
      const prizeButtons = screen.getAllByText('開始抽獎');
      expect(prizeButtons[1]).toBeDisabled();
    });

    // Should show "人數不足" message
    expect(screen.getByText('人數不足 (需要 2 人)')).toBeInTheDocument();
  });

  it('should prevent completing setup without participants', async () => {
    render(<App />);

    // Try to complete setup without adding participants
    const completeButton = screen.getByText('完成設定');
    expect(completeButton).toBeDisabled();
  });

  it('should allow navigation between states', async () => {
    render(<App />);

    // Add participant and go to overview
    const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
    await user.type(participantInput, '導航測試者');
    await user.click(screen.getByText('新增'));
    await user.click(screen.getByText('完成設定'));

    // Should be in overview
    await waitFor(() => {
      expect(screen.getByText('修改設定')).toBeInTheDocument();
    });

    // Go back to setup
    await user.click(screen.getByText('修改設定'));

    // Should be back in setup
    expect(screen.getByText('抽獎系統設定')).toBeInTheDocument();
    expect(screen.getByText('導航測試者')).toBeInTheDocument();
  });

  it('should handle repeat drawing settings', async () => {
    render(<App />);

    // Add participant
    const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
    await user.type(participantInput, '重複測試者');
    await user.click(screen.getByText('新增'));

    // Enable repeat drawing
    const repeatCheckbox = screen.getByLabelText('允許重複中獎');
    await user.click(repeatCheckbox);
    expect(repeatCheckbox).toBeChecked();

    // Complete setup
    await user.click(screen.getByText('完成設定'));

    // Should be able to proceed without errors
    await waitFor(() => {
      expect(screen.getByText('修改設定')).toBeInTheDocument();
    });
  });
});
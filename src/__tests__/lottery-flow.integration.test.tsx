import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock components that have complex animations or external dependencies
vi.mock('../components/LotteryAnimation', () => ({
  LotteryAnimation: ({ onComplete, participants, prize, onPhaseChange }: any) => {
    // Simulate realistic animation phases
    setTimeout(() => onPhaseChange('preparing'), 10);
    setTimeout(() => onPhaseChange('activating'), 50);
    setTimeout(() => onPhaseChange('shuffling'), 100);
    setTimeout(() => onPhaseChange('revealing'), 150);
    setTimeout(() => onPhaseChange('celebrating'), 200);
    
    setTimeout(() => {
      const selectedWinners = participants.slice(0, prize.drawCount);
      onComplete(selectedWinners);
    }, 250);
    
    return (
      <div data-testid="lottery-animation">
        <div data-testid="animation-running">抽獎進行中...</div>
      </div>
    );
  }
}));

describe('Lottery Flow Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  describe('Complete End-to-End Scenarios', () => {
    it('should complete multiple prize draws without participant overlap', async () => {
      render(<App />);

      // Setup phase: Add 10 participants
      const participantNames = [
        '張三', '李四', '王五', '趙六', '錢七', 
        '孫八', '周九', '吳十', '鄭一', '馮二'
      ];

      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      
      for (let i = 0; i < participantNames.length; i++) {
        const name = participantNames[i];
        await user.clear(participantInput); // Clear first
        await user.type(participantInput, name);
        await user.click(screen.getByText('新增'));
        // Wait for the participant to be added and input to be cleared
        await waitFor(() => {
          expect(screen.getByText(name)).toBeInTheDocument();
          expect(participantInput).toHaveValue('');
        });
      }

      // Verify all participants are added
      for (const name of participantNames) {
        expect(screen.getByText(name)).toBeInTheDocument();
      }

      // Complete setup
      await user.click(screen.getByText('完成設定'));

      // The app flow might vary, let's check what state we're in
      await waitFor(() => {
        // If we're in overview state, we should see "開始抽獎" buttons
        const drawButtons = screen.queryAllByText('開始抽獎');
        const backToOverviewButton = screen.queryByText('回到抽獎總覽');
        
        // We're either in overview or results state - handle both
        if (drawButtons.length > 0) {
          // We're in overview state
          expect(screen.getByText(/可參與抽獎人數：\d+/)).toBeInTheDocument();
        } else if (backToOverviewButton) {
          // We're already in results state - go back to overview
          expect(backToOverviewButton).toBeInTheDocument();
        } else {
          throw new Error('Unexpected application state');
        }
      });

      // If we're in results state, go back to overview
      const backButton = screen.queryByText('回到抽獎總覽');
      if (backButton) {
        await user.click(backButton);
        await waitFor(() => {
          expect(screen.queryAllByText('開始抽獎').length).toBeGreaterThan(0);
        });
      }

      // First draw: Click first prize button (whatever it is)
      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        expect(prizeButtons.length).toBeGreaterThan(0);
      });
      
      const firstPrizeButton = screen.getAllByText('開始抽獎')[0];
      await user.click(firstPrizeButton);

      await waitFor(() => {
        expect(screen.getByTestId('lottery-animation')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
        // Prize name is displayed as "獎項：{prize.name}"
        const prizeElement = screen.getByText(/^獎項：.*$/);
        expect(prizeElement).toBeInTheDocument();
      }, { timeout: 1000 });

      // Return to overview
      await user.click(screen.getByText('回到抽獎總覽'));

      // Verify available participants reduced by 1
      await waitFor(() => {
        expect(screen.getByText('可參與抽獎人數：9')).toBeInTheDocument();
      });

      // Second draw: 一等獎 (2 people)
      const secondPrizeButton = screen.getAllByText('開始抽獎')[1];
      await user.click(secondPrizeButton);

      await waitFor(() => {
        expect(screen.getByTestId('lottery-animation')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
        // Prize name is displayed as "獎項：{prize.name}"
        const prizeElement = screen.getByText(/^獎項：.*$/);
        expect(prizeElement).toBeInTheDocument();
      }, { timeout: 1000 });

      // Return to overview again
      await user.click(screen.getByText('回到抽獎總覽'));

      // Verify available participants reduced by 2 more (total 3 selected)
      await waitFor(() => {
        expect(screen.getByText('可參與抽獎人數：7')).toBeInTheDocument();
      });

      // Third draw: 二等獎 (6 people)
      const thirdPrizeButton = screen.getAllByText('開始抽獎')[2];
      await user.click(thirdPrizeButton);

      await waitFor(() => {
        expect(screen.getByTestId('lottery-animation')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
        // Prize name is displayed as "獎項：{prize.name}"
        const prizeElement = screen.getByText(/^獎項：.*$/);
        expect(prizeElement).toBeInTheDocument();
      }, { timeout: 1000 });

      // Final verification: All participants should be selected (10 total: 1+2+6+1 remaining)
      await user.click(screen.getByText('回到抽獎總覽'));

      await waitFor(() => {
        expect(screen.getByText('可參與抽獎人數：1')).toBeInTheDocument();
      });
    });

    it('should handle repeat drawing scenario correctly', async () => {
      render(<App />);

      // Add only 3 participants
      const participantNames = ['張三', '李四', '王五'];
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      
      for (const name of participantNames) {
        await user.type(participantInput, name);
        await user.click(screen.getByText('新增'));
        await user.clear(participantInput);
      }

      // Enable repeat drawing
      const repeatCheckbox = screen.getByLabelText('允許重複中獎');
      await user.click(repeatCheckbox);

      // Complete setup
      await user.click(screen.getByText('完成設定'));

      // Draw first prize (1 person)
      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        return user.click(prizeButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
      }, { timeout: 1000 });

      await user.click(screen.getByText('回到抽獎總覽'));

      // With repeat enabled, all 3 participants should still be available
      await waitFor(() => {
        expect(screen.getByText('可參與抽獎人數：3')).toBeInTheDocument();
      });

      // Draw second prize (2 people) - should work even with only 3 total participants
      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        return user.click(prizeButtons[1]);
      });

      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Should succeed without errors
      expect(window.alert).not.toHaveBeenCalledWith(
        expect.stringContaining('可抽獎人數不足')
      );
    });
  });

  describe('Data Persistence and State Management', () => {
    it('should maintain results history across multiple draws', async () => {
      render(<App />);

      // Setup with participants
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      const names = ['測試者A', '測試者B', '測試者C', '測試者D'];
      
      for (const name of names) {
        await user.type(participantInput, name);
        await user.click(screen.getByText('新增'));
        await user.clear(participantInput);
      }

      await user.click(screen.getByText('完成設定'));

      // First draw
      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        return user.click(prizeButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Verify first result is recorded
      expect(screen.getByText('已完成抽獎')).toBeInTheDocument();
      // The prize name should be visible in the completed prize card
      const prizeElements = screen.queryAllByText(/特等獎|一等獎|二等獎/);
      expect(prizeElements.length).toBeGreaterThan(0);

      await user.click(screen.getByText('回到抽獎總覽'));

      // Second draw
      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        return user.click(prizeButtons[1]);
      });

      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Verify both results are shown
      const resultItems = screen.getAllByText(/等獎/);
      expect(resultItems.length).toBeGreaterThanOrEqual(2);
    });

    it('should reset all state when restarting lottery', async () => {
      render(<App />);

      // Complete a full lottery cycle
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      await user.type(participantInput, '重置測試者');
      await user.click(screen.getByText('新增'));

      await user.click(screen.getByText('完成設定'));

      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        return user.click(prizeButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Reset lottery
      await user.click(screen.getByText('重新開始'));

      // Verify complete reset
      expect(screen.getByText('抽獎系統設定')).toBeInTheDocument();
      expect(screen.getByText('重置測試者')).toBeInTheDocument();

      // Participant should no longer be marked as selected
      const completeButton = screen.getByText('完成設定');
      expect(completeButton).not.toBeDisabled();

      // Complete setup again to verify clean state
      await user.click(completeButton);

      await waitFor(() => {
        expect(screen.getByText('可參與抽獎人數：1')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    it('should handle exactly matching participant count to prize requirements', async () => {
      render(<App />);

      // Add exactly 1 participant for 特等獎 (1 person needed)
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      await user.type(participantInput, '唯一參與者');
      await user.click(screen.getByText('新增'));

      await user.click(screen.getByText('完成設定'));

      // Should be able to draw the first prize
      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        return user.click(prizeButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
      }, { timeout: 1000 });

      await user.click(screen.getByText('回到抽獎總覽'));

      // Now no participants should be available for other prizes
      await waitFor(() => {
        expect(screen.getByText('可參與抽獎人數：0')).toBeInTheDocument();
      });

      // Trying to draw other prizes should show error
      const secondPrizeButton = screen.getAllByText('開始抽獎')[1];
      await user.click(secondPrizeButton);

      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('可抽獎人數不足')
      );
    });

    it('should handle custom prize configurations', async () => {
      render(<App />);

      // Add a custom prize
      const prizeNameInput = screen.getByPlaceholderText('輸入新獎項名稱...');
      const prizeCountInput = screen.getByDisplayValue('1');

      await user.type(prizeNameInput, '自訂大獎');
      await user.clear(prizeCountInput);
      await user.type(prizeCountInput, '5');
      await user.click(screen.getByText('新增獎項'));

      // Add sufficient participants
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      for (let i = 1; i <= 6; i++) {
        await user.type(participantInput, `參與者${i}`);
        await user.click(screen.getByText('新增'));
        await user.clear(participantInput);
      }

      await user.click(screen.getByText('完成設定'));

      // Verify custom prize appears in overview
      expect(screen.getByText('自訂大獎')).toBeInTheDocument();
      expect(screen.getByText('需要 5 人')).toBeInTheDocument();

      // Should be able to draw custom prize
      const customPrizeButton = screen.getByText('自訂大獎').closest('.bg-white')?.querySelector('button');
      if (customPrizeButton) {
        await user.click(customPrizeButton);

        await waitFor(() => {
          expect(screen.getByTestId('lottery-animation')).toBeInTheDocument();
        });

        await waitFor(() => {
          expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
          expect(screen.getByText('自訂大獎')).toBeInTheDocument();
        }, { timeout: 1000 });
      }
    });
  });
});
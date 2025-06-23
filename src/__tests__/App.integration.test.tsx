import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from '../App';
import { Prize, Participant } from '../types/lottery';

// Mock the LotteryAnimation component to avoid complex animation testing
vi.mock('../components/LotteryAnimation', () => ({
  LotteryAnimation: ({ onComplete, participants, prize }: any) => {
    // Simulate animation completion after a short delay
    React.useEffect(() => {
      const timer = setTimeout(() => {
        const availableParticipants = participants.filter((p: any) => !p.isSelected);
        const selectedWinners = availableParticipants.slice(0, prize.drawCount);
        console.log('Mock animation complete, selected winners:', selectedWinners);
        onComplete(selectedWinners);
      }, 100);
      
      return () => clearTimeout(timer);
    }, [onComplete, participants, prize]);
    
    return <div data-testid="lottery-animation">Animation Running</div>;
  }
}));

describe('App Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    // Mock window.confirm for import tests
    vi.stubGlobal('confirm', vi.fn(() => true));
    // Mock window.alert
    vi.stubGlobal('alert', vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Complete Lottery Flow', () => {
    it('should complete a full lottery cycle from setup to results', async () => {
      render(<App />);

      // Verify initial state is setup
      expect(screen.getByText('抽獎系統設定')).toBeInTheDocument();

      // Add participants
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      await user.type(participantInput, '張三');
      await user.click(screen.getByText('新增'));
      
      await user.type(participantInput, '李四');
      await user.click(screen.getByText('新增'));
      
      await user.type(participantInput, '王五');
      await user.click(screen.getByText('新增'));

      // Verify participants are added
      expect(screen.getByText('張三')).toBeInTheDocument();
      expect(screen.getByText('李四')).toBeInTheDocument();
      expect(screen.getByText('王五')).toBeInTheDocument();

      // Complete setup
      const completeButton = screen.getByText('完成設定');
      expect(completeButton).not.toBeDisabled();
      await user.click(completeButton);

      // Should now be in overview state
      await waitFor(() => {
        expect(screen.getByText('修改設定')).toBeInTheDocument();
      });

      // Start prize draw for first prize
      const prizeButtons = screen.getAllByText('開始抽獎');
      await user.click(prizeButtons[0]); // Click first prize button

      // Should now be in drawing state
      await waitFor(() => {
        expect(screen.getByTestId('lottery-animation')).toBeInTheDocument();
      });

      // Wait for animation to complete and results to show
      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Verify results are displayed
      expect(screen.getByText((content, element) => 
        content.includes('特等獎') && element?.tagName === 'DIV'
      )).toBeInTheDocument();
      expect(screen.getByText('回到抽獎總覽')).toBeInTheDocument();
      expect(screen.getByText('重新設定')).toBeInTheDocument();
    });

    it('should handle insufficient participants gracefully', async () => {
      render(<App />);

      // Add only one participant
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      await user.type(participantInput, '張三');
      await user.click(screen.getByText('新增'));

      // Complete setup
      await user.click(screen.getByText('完成設定'));

      // Check that the second prize button (needs 2 people) is disabled
      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        expect(prizeButtons[1]).toBeDisabled(); // Second prize should be disabled
      });

      // First prize button (needs 1 person) should be enabled
      const prizeButtons = screen.getAllByText('開始抽獎');
      expect(prizeButtons[0]).not.toBeDisabled(); // First prize should be enabled
    });
  });

  describe('Repeat Drawing Settings', () => {
    it('should prevent repeat winners when allowRepeat is false', async () => {
      render(<App />);

      // Add participants
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      const participants = ['張三', '李四', '王五', '趙六'];
      
      for (const name of participants) {
        await user.type(participantInput, name);
        await user.click(screen.getByText('新增'));
        participantInput.focus();
        await user.clear(participantInput);
      }

      // Ensure allowRepeat is false (default)
      const repeatCheckbox = screen.getByLabelText('允許重複中獎');
      expect(repeatCheckbox).not.toBeChecked();

      // Complete setup
      await user.click(screen.getByText('完成設定'));

      // Draw first prize
      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        return user.click(prizeButtons[0]);
      });

      // Wait for first draw to complete
      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Go back to overview
      await user.click(screen.getByText('回到抽獎總覽'));

      // Try to draw second prize - should have one less available participant
      await waitFor(() => {
        const availableCount = screen.getByText(/可參與抽獎人數：\d+/);
        expect(availableCount.textContent).toContain('3'); // One less than original 4
      });
    });

    it('should allow repeat winners when allowRepeat is true', async () => {
      render(<App />);

      // Add participants
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      await user.type(participantInput, '張三');
      await user.click(screen.getByText('新增'));
      
      await user.clear(participantInput);
      await user.type(participantInput, '李四');
      await user.click(screen.getByText('新增'));

      // Enable repeat drawing
      const repeatCheckbox = screen.getByLabelText('允許重複中獎');
      await user.click(repeatCheckbox);
      expect(repeatCheckbox).toBeChecked();

      // Complete setup
      await user.click(screen.getByText('完成設定'));

      // Draw first prize
      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        return user.click(prizeButtons[0]);
      });

      // Wait for first draw to complete
      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Go back to overview
      await user.click(screen.getByText('回到抽獎總覽'));

      // Available participants should still be the same (allowing repeats)
      await waitFor(() => {
        const availableCount = screen.getByText(/可參與抽獎人數：\d+/);
        expect(availableCount.textContent).toContain('2'); // Same as original
      });
    });
  });

  describe('Configuration Import/Export', () => {
    it('should export configuration correctly', async () => {
      // Mock link element for download
      const mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        href: '',
        download: ''
      };
      
      const originalCreateElement = document.createElement;
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          return mockLink as any;
        }
        return originalCreateElement.call(document, tagName);
      });

      render(<App />);

      // Add some data first
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      await user.type(participantInput, '測試用戶');
      await user.click(screen.getByText('新增'));

      // Export configuration
      await user.click(screen.getByText('匯出設定'));

      // Verify export functionality was called
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', expect.any(String));
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringMatching(/lottery-config-.*\.json/));
      expect(mockLink.click).toHaveBeenCalled();
      
      // Clean up
      createElementSpy.mockRestore();
    });

    it('should handle invalid import file gracefully', async () => {
      render(<App />);

      // Mock file input
      const fileInput = screen.getByText('匯入設定').closest('label')?.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();

      // Create invalid file content
      const invalidFile = new File(['invalid json content'], 'test-config.json', {
        type: 'application/json',
      });

      // Simulate file selection
      if (fileInput) {
        // Reset the input first
        fileInput.value = '';
        Object.defineProperty(fileInput, 'files', {
          value: [invalidFile],
          writable: false,
          configurable: true,
        });
        act(() => {
          fireEvent.change(fileInput);
        });
      }

      // Should show error alert
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('⚠️ 匯入失敗：無法解析檔案內容！');
      });
    });
  });

  describe('State Management', () => {
    it('should reset lottery state correctly', async () => {
      render(<App />);

      // Set up and complete a lottery draw
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      await user.type(participantInput, '張三');
      await user.click(screen.getByText('新增'));

      await user.click(screen.getByText('完成設定'));

      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        return user.click(prizeButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Reset lottery
      await user.click(screen.getByText('重新設定'));

      // Should be back to setup state
      expect(screen.getByText('抽獎系統設定')).toBeInTheDocument();
      
      // Previous participants should be reset (no longer selected)
      expect(screen.getByText('張三')).toBeInTheDocument();
    });

    it('should navigate between states correctly', async () => {
      render(<App />);

      // Add participant and complete setup
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      await user.type(participantInput, '張三');
      await user.click(screen.getByText('新增'));
      await user.click(screen.getByText('完成設定'));

      // Should be in overview - check for overview specific elements
      await waitFor(() => {
        expect(screen.getByText('修改設定')).toBeInTheDocument();
      });

      // Go back to settings
      await user.click(screen.getByText('修改設定'));

      // Should be back in setup
      expect(screen.getByText('抽獎系統設定')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should prevent setup completion with no participants', async () => {
      render(<App />);

      // Try to complete setup without participants
      const completeButton = screen.getByText('完成設定');
      expect(completeButton).toBeDisabled();
    });

    it('should prevent setup completion with no prizes', async () => {
      render(<App />);

      // Add participant but remove all prizes
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      await user.type(participantInput, '張三');
      await user.click(screen.getByText('新增'));

      // Remove all default prizes (delete buttons are icon-only, so find by class)
      const deleteButtons = document.querySelectorAll('button.text-red-600');
      for (const button of deleteButtons) {
        await user.click(button as HTMLElement);
      }

      // Complete button should be disabled
      const completeButton = screen.getByText('完成設定');
      expect(completeButton).toBeDisabled();
    });
  });

  describe('Prize Management', () => {
    it('should handle multiple prize draws in sequence', async () => {
      render(<App />);

      // Add sufficient participants
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      const participants = ['張三', '李四', '王五', '趙六', '錢七', '孫八', '周九', '吳十'];
      
      for (const name of participants) {
        await user.type(participantInput, name);
        await user.click(screen.getByText('新增'));
        participantInput.focus();
        await user.clear(participantInput);
      }

      await user.click(screen.getByText('完成設定'));

      // Draw first prize (特等獎 - 1 person)
      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        return user.click(prizeButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
      }, { timeout: 2000 });

      await user.click(screen.getByText('回到抽獎總覽'));

      // Draw second prize (一等獎 - 2 people)
      await waitFor(() => {
        const prizeButtons = screen.getAllByText('開始抽獎');
        expect(prizeButtons.length).toBeGreaterThan(1);
        return user.click(prizeButtons[1]);
      });

      await waitFor(() => {
        expect(screen.getByText('恭喜中獎！')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Verify results show a prize (could be any prize)
      expect(screen.getByText('重新設定')).toBeInTheDocument();
      expect(screen.getByText('回到抽獎總覽')).toBeInTheDocument();
    });
  });
});
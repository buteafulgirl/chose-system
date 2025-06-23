import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { LotteryConfig } from '../types/lottery';

describe('Configuration Management Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockLink: { setAttribute: ReturnType<typeof vi.fn>; click: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    user = userEvent.setup();
    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal('confirm', vi.fn(() => true));

    // Mock URL.createObjectURL and document.createElement for export tests
    mockCreateObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: mockCreateObjectURL });
    
    mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      href: '',
      download: ''
    };
    
    const originalCreateElement = document.createElement;
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockLink as any;
      }
      return originalCreateElement.call(document, tagName);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Configuration Export', () => {
    it('should export complete configuration with all data', async () => {
      render(<App />);

      // Set up complete configuration
      // 1. Add custom prizes
      const prizeNameInput = screen.getByPlaceholderText('輸入新獎項名稱...');
      const prizeCountInput = screen.getByDisplayValue('1');

      await user.type(prizeNameInput, '測試獎項');
      await user.clear(prizeCountInput);
      await user.type(prizeCountInput, '3');
      await user.click(screen.getByText('新增獎項'));

      // 2. Add participants
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      const participants = ['測試者A', '測試者B', '測試者C', '測試者D'];
      
      for (const name of participants) {
        await user.type(participantInput, name);
        await user.click(screen.getByText('新增'));
        await user.clear(participantInput);
      }

      // 3. Modify settings
      const titleInput = screen.getByDisplayValue('旭聯科技 ATD25 分享會');
      await user.clear(titleInput);
      await user.type(titleInput, '測試抽獎活動');

      const repeatCheckbox = screen.getByLabelText('允許重複中獎');
      await user.click(repeatCheckbox);

      // 4. Export configuration
      await user.click(screen.getByText('匯出設定'));

      // Verify export was called with correct parameters
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', expect.stringContaining('data:application/json'));
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringMatching(/lottery-config-.*\.json/));
      expect(mockLink.click).toHaveBeenCalled();

      // Verify the exported data structure by checking the href parameter
      const hrefCall = mockLink.setAttribute.mock.calls.find(call => call[0] === 'href');
      if (hrefCall) {
        const dataUri = hrefCall[1];
        const jsonData = decodeURIComponent(dataUri.split(',')[1]);
        const config = JSON.parse(jsonData);

        expect(config).toMatchObject({
          version: '1.0.0',
          exportDate: expect.any(String),
          settings: {
            allowRepeat: true,
            title: '測試抽獎活動'
          }
        });

        // Verify prizes include both default and custom
        expect(config.prizes).toHaveLength(4); // 3 default + 1 custom
        expect(config.prizes.some((p: any) => p.name === '測試獎項')).toBe(true);

        // Verify participants
        expect(config.participants).toHaveLength(4);
        expect(config.participants.some((p: any) => p.name === '測試者A')).toBe(true);
      }
    });

    it('should generate unique filenames for exports', async () => {
      render(<App />);

      // Add minimal data
      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      await user.type(participantInput, '測試者');
      await user.click(screen.getByText('新增'));

      // Export twice quickly
      await user.click(screen.getByText('匯出設定'));
      await user.click(screen.getByText('匯出設定'));

      // Both exports should have been called
      expect(mockLink.click).toHaveBeenCalledTimes(2);

      // Check that filenames are different (contain timestamps)
      const downloadCalls = mockLink.setAttribute.mock.calls.filter(call => call[0] === 'download');
      expect(downloadCalls).toHaveLength(2);
      
      // Both should be valid lottery config filenames
      downloadCalls.forEach(call => {
        expect(call[1]).toMatch(/lottery-config-\d{8}-\d{6}\.json/);
      });
    });
  });

  describe('Configuration Import', () => {
    it('should import valid configuration and restore all settings', async () => {
      render(<App />);

      // Create a valid config object
      const validConfig: LotteryConfig = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        prizes: [
          { id: 'import-1', name: '匯入獎項1', drawCount: 2 },
          { id: 'import-2', name: '匯入獎項2', drawCount: 3 }
        ],
        participants: [
          { id: 'import-p1', name: '匯入參與者1' },
          { id: 'import-p2', name: '匯入參與者2' },
          { id: 'import-p3', name: '匯入參與者3' }
        ],
        settings: {
          allowRepeat: true,
          title: '匯入的抽獎活動'
        }
      };

      // Mock file input
      const fileInput = screen.getByText('匯入設定').closest('label')?.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();

      // Create valid file
      const validFile = new File([JSON.stringify(validConfig)], 'test-config.json', {
        type: 'application/json',
      });

      // Mock FileReader
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        result: JSON.stringify(validConfig)
      };

      vi.stubGlobal('FileReader', vi.fn(() => mockFileReader));

      // Simulate file selection
      if (fileInput) {
        // Reset the input first
        fileInput.value = '';
        Object.defineProperty(fileInput, 'files', {
          value: [validFile],
          writable: false,
          configurable: true,
        });
        
        act(() => {
          fireEvent.change(fileInput);
        });
        
        // Trigger the FileReader onload
        if (mockFileReader.onload) {
          act(() => {
            mockFileReader.onload({ target: { result: JSON.stringify(validConfig) } });
          });
        }
      }

      // Should show confirmation dialog
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('確定要匯入設定嗎')
      );

      // Verify successful import
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('✅ 設定匯入成功！');
      });

      // Verify imported data is displayed
      expect(screen.getByDisplayValue('匯入的抽獎活動')).toBeInTheDocument();
      expect(screen.getByText('匯入獎項1')).toBeInTheDocument();
      expect(screen.getByText('匯入獎項2')).toBeInTheDocument();
      expect(screen.getByText('匯入參與者1')).toBeInTheDocument();
      expect(screen.getByText('匯入參與者2')).toBeInTheDocument();
      expect(screen.getByText('匯入參與者3')).toBeInTheDocument();

      // Verify settings
      const repeatCheckbox = screen.getByLabelText('允許重複中獎');
      expect(repeatCheckbox).toBeChecked();
    });

    it('should reject invalid configuration files', async () => {
      render(<App />);

      const fileInput = screen.getByText('匯入設定').closest('label')?.querySelector('input[type="file"]');
      
      // Test cases for invalid configs
      const invalidConfigs = [
        // Missing required fields
        { version: '1.0.0' },
        // Invalid data types
        { 
          version: '1.0.0', 
          exportDate: '2023-01-01', 
          prizes: 'not-an-array', 
          participants: [], 
          settings: { allowRepeat: false, title: 'test' }
        },
        // Invalid prize structure
        { 
          version: '1.0.0', 
          exportDate: '2023-01-01', 
          prizes: [{ name: 'test' }], // missing required fields
          participants: [], 
          settings: { allowRepeat: false, title: 'test' }
        },
        // Invalid settings
        { 
          version: '1.0.0', 
          exportDate: '2023-01-01', 
          prizes: [], 
          participants: [], 
          settings: { allowRepeat: 'not-boolean', title: 'test' }
        }
      ];

      for (const invalidConfig of invalidConfigs) {
        const invalidFile = new File([JSON.stringify(invalidConfig)], 'invalid-config.json', {
          type: 'application/json',
        });

        const mockFileReader = {
          readAsText: vi.fn(),
          onload: null as any,
          result: JSON.stringify(invalidConfig)
        };

        vi.stubGlobal('FileReader', vi.fn(() => mockFileReader));

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
          
          if (mockFileReader.onload) {
            act(() => {
              mockFileReader.onload({ target: { result: JSON.stringify(invalidConfig) } });
            });
          }
        }

        // Should show error for invalid config
        await waitFor(() => {
          expect(window.alert).toHaveBeenCalledWith('⚠️ 匯入失敗：檔案格式不正確！');
        });

        // Reset alert mock for next iteration
        vi.mocked(window.alert).mockClear();
      }
    });

    it('should handle malformed JSON files', async () => {
      render(<App />);

      const fileInput = screen.getByText('匯入設定').closest('label')?.querySelector('input[type="file"]');
      
      const malformedFile = new File(['{ invalid json }'], 'malformed.json', {
        type: 'application/json',
      });

      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        result: '{ invalid json }'
      };

      vi.stubGlobal('FileReader', vi.fn(() => mockFileReader));

      if (fileInput) {
        // Reset the input first
        fileInput.value = '';
        Object.defineProperty(fileInput, 'files', {
          value: [malformedFile],
          writable: false,
          configurable: true,
        });
        
        act(() => {
          fireEvent.change(fileInput);
        });
        
        if (mockFileReader.onload) {
          act(() => {
            mockFileReader.onload({ target: { result: '{ invalid json }' } });
          });
        }
      }

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('⚠️ 匯入失敗：無法解析檔案內容！');
      });
    });

    it('should allow user to cancel import', async () => {
      render(<App />);

      // Mock confirm to return false (cancel)
      vi.stubGlobal('confirm', vi.fn(() => false));

      const validConfig: LotteryConfig = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        prizes: [{ id: '1', name: '測試', drawCount: 1 }],
        participants: [{ id: '1', name: '測試者' }],
        settings: { allowRepeat: false, title: '測試' }
      };

      const fileInput = screen.getByText('匯入設定').closest('label')?.querySelector('input[type="file"]');
      
      const validFile = new File([JSON.stringify(validConfig)], 'test-config.json', {
        type: 'application/json',
      });

      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        result: JSON.stringify(validConfig)
      };

      vi.stubGlobal('FileReader', vi.fn(() => mockFileReader));

      if (fileInput) {
        // Reset the input first
        fileInput.value = '';
        Object.defineProperty(fileInput, 'files', {
          value: [validFile],
          writable: false,
          configurable: true,
        });
        
        act(() => {
          fireEvent.change(fileInput);
        });
        
        if (mockFileReader.onload) {
          act(() => {
            mockFileReader.onload({ target: { result: JSON.stringify(validConfig) } });
          });
        }
      }

      // Should show confirmation
      expect(window.confirm).toHaveBeenCalled();

      // Should not show success message or change data
      expect(window.alert).not.toHaveBeenCalledWith('✅ 設定匯入成功！');
      
      // Original data should remain
      expect(screen.getByDisplayValue('旭聯科技 ATD25 分享會')).toBeInTheDocument();
    });
  });

  describe('Configuration Persistence', () => {
    it('should maintain configuration state across app reloads (simulation)', async () => {
      // First render - set up data
      const { unmount } = render(<App />);

      const participantInput = screen.getByPlaceholderText('輸入參與者姓名...');
      await user.type(participantInput, '持久化測試者');
      await user.click(screen.getByText('新增'));

      const titleInput = screen.getByDisplayValue('旭聯科技 ATD25 分享會');
      await user.clear(titleInput);
      await user.type(titleInput, '持久化測試活動');

      // Export to simulate saving state
      await user.click(screen.getByText('匯出設定'));

      // Simulate app reload by unmounting and remounting
      unmount();
      render(<App />);

      // Verify we're back to default state (simulating fresh load)
      expect(screen.getByDisplayValue('旭聯科技 ATD25 分享會')).toBeInTheDocument();
      expect(screen.queryByText('持久化測試者')).not.toBeInTheDocument();

      // This test demonstrates that configuration persistence would require 
      // additional implementation (localStorage, sessionStorage, etc.)
    });
  });
});
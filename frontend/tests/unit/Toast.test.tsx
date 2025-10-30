import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from '../../src/components/Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render toast with message', () => {
      const onClose = vi.fn();
      render(<Toast message="Test message" onClose={onClose} />);
      
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render with success type by default', () => {
      const onClose = vi.fn();
      const { container } = render(<Toast message="Success" onClose={onClose} />);
      
      const toastElement = container.querySelector('.bg-green-500');
      expect(toastElement).toBeInTheDocument();
    });

    it('should render with error type styling', () => {
      const onClose = vi.fn();
      const { container } = render(
        <Toast message="Error message" type="error" onClose={onClose} />
      );
      
      const toastElement = container.querySelector('.bg-red-500');
      expect(toastElement).toBeInTheDocument();
    });

    it('should render with info type styling', () => {
      const onClose = vi.fn();
      const { container } = render(
        <Toast message="Info message" type="info" onClose={onClose} />
      );
      
      const toastElement = container.querySelector('.bg-blue-500');
      expect(toastElement).toBeInTheDocument();
    });

    it('should render close button', () => {
      const onClose = vi.fn();
      render(<Toast message="Test" onClose={onClose} />);
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('should render appropriate icon for success type', () => {
      const onClose = vi.fn();
      const { container } = render(
        <Toast message="Success" type="success" onClose={onClose} />
      );
      
      // Success icon has checkmark path
      const checkmarkPath = container.querySelector('path[d*="M5 13l4 4L19 7"]');
      expect(checkmarkPath).toBeInTheDocument();
    });

    it('should render appropriate icon for error type', () => {
      const onClose = vi.fn();
      const { container } = render(
        <Toast message="Error" type="error" onClose={onClose} />
      );
      
      // Error icon has X path
      const xPath = container.querySelector('path[d*="M6 18L18 6M6 6l12 12"]');
      expect(xPath).toBeInTheDocument();
    });

    it('should render appropriate icon for info type', () => {
      const onClose = vi.fn();
      const { container } = render(
        <Toast message="Info" type="info" onClose={onClose} />
      );
      
      // Info icon has info circle path
      const infoPath = container.querySelector('path[d*="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"]');
      expect(infoPath).toBeInTheDocument();
    });
  });

  describe('Auto-dismiss behavior', () => {
    it('should call onClose after default duration (3000ms)', () => {
      const onClose = vi.fn();
      render(<Toast message="Test" onClose={onClose} />);
      
      expect(onClose).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(3000);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose after custom duration', () => {
      const onClose = vi.fn();
      render(<Toast message="Test" onClose={onClose} duration={5000} />);
      
      expect(onClose).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(5000);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose before duration expires', () => {
      const onClose = vi.fn();
      render(<Toast message="Test" onClose={onClose} duration={5000} />);
      
      vi.advanceTimersByTime(4999);
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should cleanup timer on unmount', () => {
      const onClose = vi.fn();
      const { unmount } = render(<Toast message="Test" onClose={onClose} />);
      
      unmount();
      vi.advanceTimersByTime(3000);
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('User interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      vi.useRealTimers(); // Use real timers for user interactions
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Toast message="Test" onClose={onClose} />);
      
      const closeButton = screen.getByRole('button');
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
      vi.useFakeTimers(); // Restore fake timers
    });

    it('should allow manual close before auto-dismiss', async () => {
      const onClose = vi.fn();
      render(<Toast message="Test" onClose={onClose} duration={5000} />);
      
      vi.advanceTimersByTime(2000);
      
      vi.useRealTimers(); // Use real timers for user interactions
      const user = userEvent.setup();
      const closeButton = screen.getByRole('button');
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
      vi.useFakeTimers(); // Restore fake timers
    });
  });

  describe('Styling and classes', () => {
    it('should have fixed positioning', () => {
      const onClose = vi.fn();
      const { container } = render(<Toast message="Test" onClose={onClose} />);
      
      const toastElement = container.querySelector('.fixed');
      expect(toastElement).toBeInTheDocument();
    });

    it('should have animation class', () => {
      const onClose = vi.fn();
      const { container } = render(<Toast message="Test" onClose={onClose} />);
      
      const toastElement = container.querySelector('.animate-slide-in-right');
      expect(toastElement).toBeInTheDocument();
    });

    it('should have proper z-index for overlay', () => {
      const onClose = vi.fn();
      const { container } = render(<Toast message="Test" onClose={onClose} />);
      
      const toastElement = container.querySelector('.z-50');
      expect(toastElement).toBeInTheDocument();
    });

    it('should display message with proper styling', () => {
      const onClose = vi.fn();
      const { container } = render(<Toast message="Test message" onClose={onClose} />);
      
      const messageElement = screen.getByText('Test message');
      expect(messageElement).toHaveClass('font-medium');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty message', () => {
      const onClose = vi.fn();
      const { container } = render(<Toast message="" onClose={onClose} />);
      
      const messageSpan = container.querySelector('span.font-medium');
      expect(messageSpan).toBeInTheDocument();
      expect(messageSpan).toHaveTextContent('');
    });

    it('should handle very long messages', () => {
      const onClose = vi.fn();
      const longMessage = 'A'.repeat(200);
      render(<Toast message={longMessage} onClose={onClose} />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle duration of 0', () => {
      const onClose = vi.fn();
      render(<Toast message="Test" onClose={onClose} duration={0} />);
      
      vi.advanceTimersByTime(0);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle very short duration', () => {
      const onClose = vi.fn();
      render(<Toast message="Test" onClose={onClose} duration={100} />);
      
      vi.advanceTimersByTime(100);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle very long duration', () => {
      const onClose = vi.fn();
      render(<Toast message="Test" onClose={onClose} duration={60000} />);
      
      vi.advanceTimersByTime(59999);
      expect(onClose).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button', () => {
      const onClose = vi.fn();
      render(<Toast message="Test" onClose={onClose} />);
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('should display message text for screen readers', () => {
      const onClose = vi.fn();
      render(<Toast message="Important notification" onClose={onClose} />);
      
      expect(screen.getByText('Important notification')).toBeInTheDocument();
    });
  });

  describe('Multiple toasts', () => {
    it('should handle multiple toasts with different types', () => {
      const onClose1 = vi.fn();
      const onClose2 = vi.fn();
      const onClose3 = vi.fn();
      
      const { container } = render(
        <>
          <Toast message="Success" type="success" onClose={onClose1} />
          <Toast message="Error" type="error" onClose={onClose2} />
          <Toast message="Info" type="info" onClose={onClose3} />
        </>
      );
      
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
      
      expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
      expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
      expect(container.querySelector('.bg-blue-500')).toBeInTheDocument();
    });
  });
});

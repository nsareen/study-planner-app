import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConfirmDialog, { useConfirmDialog } from '../../../src/components/ConfirmDialog';
import '@testing-library/jest-dom';

describe('ConfirmDialog Component', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test Message"
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test Message"
        />
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('should display title and message correctly', () => {
      const title = 'Delete Confirmation';
      const message = 'Are you sure you want to delete this item?';

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title={title}
          message={message}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  });

  describe('Dialog Types', () => {
    it('should display warning type by default', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Warning"
          message="This is a warning"
        />
      );

      const confirmButton = screen.getByText('Yes, Continue');
      expect(confirmButton).toHaveClass('bg-yellow-500');
    });

    it('should display danger type with trash icon and warning message', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete Item"
          message="This will delete the item"
          type="danger"
        />
      );

      expect(screen.getByText('⚠️ This action cannot be undone!')).toBeInTheDocument();
      const confirmButton = screen.getByText('Yes, Continue');
      expect(confirmButton).toHaveClass('bg-red-500');
    });

    it('should display info type with blue styling', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Information"
          message="This is an info message"
          type="info"
        />
      );

      const confirmButton = screen.getByText('Yes, Continue');
      expect(confirmButton).toHaveClass('bg-blue-500');
    });

    it('should not display warning message for warning type', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Warning"
          message="This is a warning"
          type="warning"
        />
      );

      expect(screen.queryByText('⚠️ This action cannot be undone!')).not.toBeInTheDocument();
    });

    it('should not display warning message for info type', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Info"
          message="This is an info"
          type="info"
        />
      );

      expect(screen.queryByText('⚠️ This action cannot be undone!')).not.toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onConfirm and onClose when confirm button is clicked', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
        />
      );

      const confirmButton = screen.getByText('Yes, Continue');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel button is clicked', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should call onClose when X button is clicked', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
        />
      );

      const closeButton = screen.getByLabelText('Close dialog');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Custom Text', () => {
    it('should display custom confirmText', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
          confirmText="Delete Now"
        />
      );

      expect(screen.getByText('Delete Now')).toBeInTheDocument();
      expect(screen.queryByText('Yes, Continue')).not.toBeInTheDocument();
    });

    it('should display custom cancelText', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
          cancelText="Go Back"
        />
      );

      expect(screen.getByText('Go Back')).toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('should display both custom confirmText and cancelText', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
          confirmText="Proceed"
          cancelText="Abort"
        />
      );

      expect(screen.getByText('Proceed')).toBeInTheDocument();
      expect(screen.getByText('Abort')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom confirmButtonClass when provided', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
          confirmButtonClass="bg-purple-500 text-white"
        />
      );

      const confirmButton = screen.getByText('Yes, Continue');
      expect(confirmButton).toHaveClass('bg-purple-500');
      expect(confirmButton).toHaveClass('text-white');
    });

    it('should use default styling when confirmButtonClass is not provided', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
          type="warning"
        />
      );

      const confirmButton = screen.getByText('Yes, Continue');
      expect(confirmButton).toHaveClass('bg-yellow-500');
    });
  });

  describe('Backdrop Click Behavior', () => {
    it('should close dialog when backdrop is clicked for non-danger type', () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
          type="warning"
        />
      );

      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should NOT close dialog when backdrop is clicked for danger type', () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete"
          message="This is dangerous"
          type="danger"
        />
      );

      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should close dialog when backdrop is clicked for info type', () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Info"
          message="Information"
          type="info"
        />
      );

      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title and message', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title=""
          message=""
        />
      );

      // Dialog should still render with empty strings
      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeInTheDocument();
    });

    it('should handle long title and message', () => {
      const longTitle = 'A'.repeat(200);
      const longMessage = 'B'.repeat(500);

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title={longTitle}
          message={longMessage}
        />
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle multiple rapid clicks on confirm button', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
        />
      );

      const confirmButton = screen.getByText('Yes, Continue');
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);

      // Should only be called once per click (3 times total)
      expect(mockOnConfirm).toHaveBeenCalledTimes(3);
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });
});

// useConfirmDialog Hook Tests
describe('useConfirmDialog Hook', () => {
  const TestComponent = () => {
    const { dialogState, showConfirm, hideConfirm } = useConfirmDialog();

    return (
      <div>
        <button onClick={() => showConfirm('Title', 'Message', vi.fn())}>
          Show Warning
        </button>
        <button onClick={() => showConfirm('Danger', 'Delete?', vi.fn(), 'danger')}>
          Show Danger
        </button>
        <button onClick={() => showConfirm('Info', 'Info message', vi.fn(), 'info')}>
          Show Info
        </button>
        <button onClick={hideConfirm}>
          Hide
        </button>
        <ConfirmDialog
          isOpen={dialogState.isOpen}
          onClose={hideConfirm}
          onConfirm={dialogState.onConfirm}
          title={dialogState.title}
          message={dialogState.message}
          type={dialogState.type}
        />
      </div>
    );
  };

  it('should start with dialog closed', () => {
    render(<TestComponent />);
    expect(screen.queryByText('Title')).not.toBeInTheDocument();
  });

  it('should open dialog when showConfirm is called', () => {
    render(<TestComponent />);

    const showButton = screen.getByText('Show Warning');
    fireEvent.click(showButton);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('should close dialog when hideConfirm is called', () => {
    render(<TestComponent />);

    const showButton = screen.getByText('Show Warning');
    fireEvent.click(showButton);
    expect(screen.getByText('Title')).toBeInTheDocument();

    const hideButton = screen.getByText('Hide');
    fireEvent.click(hideButton);

    // Dialog should be closed (not rendered)
    expect(screen.queryByText('Message')).not.toBeInTheDocument();
  });

  it('should show danger type dialog', () => {
    render(<TestComponent />);

    const showButton = screen.getByText('Show Danger');
    fireEvent.click(showButton);

    expect(screen.getByText('Danger')).toBeInTheDocument();
    expect(screen.getByText('Delete?')).toBeInTheDocument();
    expect(screen.getByText('⚠️ This action cannot be undone!')).toBeInTheDocument();
  });

  it('should show info type dialog', () => {
    render(<TestComponent />);

    const showButton = screen.getByText('Show Info');
    fireEvent.click(showButton);

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });
});

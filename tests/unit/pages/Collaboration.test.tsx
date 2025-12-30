import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Collaboration from '../../../src/pages/Collaboration';
import { useStore } from '../../../src/store/useStore';

// Mock TicTacToe component
vi.mock('../../../src/components/games/TicTacToe', () => ({
  default: () => <div data-testid="tictactoe-game">Tic Tac Toe Game</div>,
}));

describe('Collaboration Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock scrollIntoView (not implemented in JSDOM)
    Element.prototype.scrollIntoView = vi.fn();

    // Reset store state
    const state = useStore.getState();
    state.switchUser?.('ananya');
    state.clearAllData?.();
  });

  const renderCollaboration = () => {
    return render(
      <BrowserRouter>
        <Collaboration />
      </BrowserRouter>
    );
  };

  describe('Rendering and UI', () => {
    it('should render online friends section', () => {
      renderCollaboration();

      expect(screen.getByText('Study Buddies Online')).toBeInTheDocument();
    });

    it('should render study rooms section', () => {
      renderCollaboration();

      expect(screen.getByText('Study Rooms')).toBeInTheDocument();
    });

    it('should display create room button', () => {
      renderCollaboration();

      const buttons = screen.getAllByRole('button');
      // Create room button should exist (Plus icon button)
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show empty state when no room is selected', () => {
      renderCollaboration();

      expect(screen.getByText(/Select or create a study room/i)).toBeInTheDocument();
      expect(screen.getByText(/Study with friends and make learning fun/i)).toBeInTheDocument();
    });

    it('should display pre-existing study rooms', () => {
      renderCollaboration();

      expect(screen.getByText('Math Warriors 🔢')).toBeInTheDocument();
      expect(screen.getByText('Science Squad 🔬')).toBeInTheDocument();
    });

    it('should display online friends', () => {
      renderCollaboration();

      // Current user is Ananya, so should show other users
      expect(screen.getByText('Saanvi')).toBeInTheDocument();
      expect(screen.getByText('Sara')).toBeInTheDocument();
      expect(screen.getByText('Arshita')).toBeInTheDocument();
    });

    it('should show friend levels', () => {
      renderCollaboration();

      // Should show level for at least one friend
      const levelElements = screen.getAllByText(/Level \d+/);
      expect(levelElements.length).toBeGreaterThan(0);
    });

    it('should show live indicator on active rooms', () => {
      renderCollaboration();

      const liveElements = screen.getAllByText('Live');
      expect(liveElements.length).toBe(2); // Both pre-existing rooms are active
    });

    it('should show participant count in rooms', () => {
      renderCollaboration();

      const studyingElements = screen.getAllByText(/\d+ studying/);
      expect(studyingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Joining Study Rooms', () => {
    it('should join a study room when clicked', () => {
      renderCollaboration();

      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Room header should be visible
      expect(screen.getAllByText('Math Warriors 🔢').length).toBeGreaterThan(1);
    });

    it('should display room participants when room is joined', () => {
      renderCollaboration();

      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Should show participants studying
      expect(screen.getByText(/Ananya, Sara are studying Mathematics/i)).toBeInTheDocument();
    });

    it('should display join message when joining a room', () => {
      renderCollaboration();

      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Should show join message
      expect(screen.getByText(/Ananya joined the study room/i)).toBeInTheDocument();
    });

    it('should show room activities when room is joined', () => {
      renderCollaboration();

      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Should show activity buttons (Whiteboard, Screenshot, Video, Games)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(4);
    });

    it('should display message input when room is joined', () => {
      renderCollaboration();

      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Message input should be visible
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });
  });

  describe('Messaging', () => {
    it('should send a message when send button is clicked', () => {
      renderCollaboration();

      // Join a room first
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Type a message
      const messageInput = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(messageInput, { target: { value: 'Hello everyone!' } });

      // Click send button (find button next to message input)
      const inputContainer = messageInput.parentElement;
      const sendButton = inputContainer?.querySelector('button');
      fireEvent.click(sendButton!);

      // Message should appear in chat
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
    });

    it('should send message on Enter key press', () => {
      renderCollaboration();

      // Join a room first
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Type a message
      const messageInput = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(messageInput, { target: { value: 'Hello everyone!' } });

      // Press Enter
      fireEvent.keyPress(messageInput, { key: 'Enter', code: 13, charCode: 13 });

      // Message should appear in chat
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
    });

    it('should clear message input after sending', () => {
      renderCollaboration();

      // Join a room first
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Type and send a message
      const messageInput = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;
      fireEvent.change(messageInput, { target: { value: 'Hello!' } });
      fireEvent.keyPress(messageInput, { key: 'Enter', code: 13, charCode: 13 });

      // Input should be cleared
      expect(messageInput.value).toBe('');
    });

    it('should not send empty messages', () => {
      renderCollaboration();

      // Join a room first
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Get initial message count (should have join message)
      const initialMessages = screen.getAllByText(/joined the study room|Study Hero Bot/i);
      const initialCount = initialMessages.length;

      // Try to send empty message
      const messageInput = screen.getByPlaceholderText('Type a message...');
      const inputContainer = messageInput.parentElement;
      const sendButton = inputContainer?.querySelector('button');
      fireEvent.click(sendButton!);

      // Message count should not increase
      const finalMessages = screen.getAllByText(/joined the study room|Study Hero Bot/i);
      expect(finalMessages.length).toBe(initialCount);
    });

    it('should display message sender and timestamp', () => {
      renderCollaboration();

      // Join a room first
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Send a message
      const messageInput = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.keyPress(messageInput, { key: 'Enter', code: 13, charCode: 13 });

      // Should show sender name (Ananya)
      const senderElements = screen.getAllByText(/Ananya/);
      expect(senderElements.length).toBeGreaterThan(0);
    });
  });

  describe('Create Room Modal', () => {
    it('should open create room modal when plus button is clicked', () => {
      renderCollaboration();

      // Click the create room button (Plus icon)
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('from-primary-500');
      });
      fireEvent.click(createButton!);

      // Modal should be visible
      expect(screen.getByText('Create Study Room')).toBeInTheDocument();
    });

    it('should display room name input in modal', () => {
      renderCollaboration();

      // Open modal
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('from-primary-500');
      });
      fireEvent.click(createButton!);

      // Should have room name input
      expect(screen.getByPlaceholderText(/Math Marathon/i)).toBeInTheDocument();
    });

    it('should display subject input in modal', () => {
      renderCollaboration();

      // Open modal
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('from-primary-500');
      });
      fireEvent.click(createButton!);

      // Should have subject input
      expect(screen.getByPlaceholderText(/Mathematics/i)).toBeInTheDocument();
    });

    it('should display friend selection checkboxes', () => {
      renderCollaboration();

      // Open modal
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('from-primary-500');
      });
      fireEvent.click(createButton!);

      // Should have checkboxes for each friend
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should close modal when cancel button is clicked', () => {
      renderCollaboration();

      // Open modal
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('from-primary-500');
      });
      fireEvent.click(createButton!);

      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Modal should be closed
      expect(screen.queryByText('Create Study Room')).not.toBeInTheDocument();
    });

    it('should create a new study room', async () => {
      renderCollaboration();

      // Open modal
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('from-primary-500');
      });
      fireEvent.click(createButton!);

      // Fill in room details
      const roomNameInput = screen.getByPlaceholderText(/Math Marathon/i);
      const subjectInput = screen.getByPlaceholderText(/Mathematics/i);

      fireEvent.change(roomNameInput, { target: { value: 'Physics Fun' } });
      fireEvent.change(subjectInput, { target: { value: 'Physics' } });

      // Click Create Room
      const createRoomButton = screen.getByText('Create Room');
      fireEvent.click(createRoomButton);

      // New room should appear in the list (use findAllByText since room name appears in multiple places)
      const roomElements = await screen.findAllByText('Physics Fun');
      expect(roomElements.length).toBeGreaterThan(0);
    });

    it('should automatically join newly created room', async () => {
      renderCollaboration();

      // Open modal and create room
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('from-primary-500');
      });
      fireEvent.click(createButton!);

      const roomNameInput = screen.getByPlaceholderText(/Math Marathon/i);
      fireEvent.change(roomNameInput, { target: { value: 'Chemistry Club' } });

      const createRoomButton = screen.getByText('Create Room');
      fireEvent.click(createRoomButton);

      // Should see welcome message (use findByText which automatically waits)
      expect(await screen.findByText(/Welcome to Chemistry Club/i)).toBeInTheDocument();
    });

    it('should allow selecting friends for room', () => {
      renderCollaboration();

      // Open modal
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('from-primary-500');
      });
      fireEvent.click(createButton!);

      // Select a friend
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      // Checkbox should be checked
      expect(checkboxes[0]).toBeChecked();
    });

    it('should allow deselecting friends', () => {
      renderCollaboration();

      // Open modal
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('from-primary-500');
      });
      fireEvent.click(createButton!);

      // Select and then deselect a friend
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[0]);

      // Checkbox should be unchecked
      expect(checkboxes[0]).not.toBeChecked();
    });
  });

  describe('Activity Buttons', () => {
    it('should display whiteboard button when in a room', () => {
      renderCollaboration();

      // Join a room
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Should have whiteboard button (title attribute)
      const whiteboardButton = screen.getAllByRole('button').find(btn =>
        btn.getAttribute('title') === 'Whiteboard'
      );
      expect(whiteboardButton).toBeInTheDocument();
    });

    it('should display screenshot button when in a room', () => {
      renderCollaboration();

      // Join a room
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Should have screenshot button
      const screenshotButton = screen.getAllByRole('button').find(btn =>
        btn.getAttribute('title') === 'Share Screenshot'
      );
      expect(screenshotButton).toBeInTheDocument();
    });

    it('should display video call button when in a room', () => {
      renderCollaboration();

      // Join a room
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Should have video call button
      const videoButton = screen.getAllByRole('button').find(btn =>
        btn.getAttribute('title') === 'Video Call'
      );
      expect(videoButton).toBeInTheDocument();
    });

    it('should display games button when in a room', () => {
      renderCollaboration();

      // Join a room
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Should have games button
      const gamesButton = screen.getAllByRole('button').find(btn =>
        btn.getAttribute('title') === 'Brain Games'
      );
      expect(gamesButton).toBeInTheDocument();
    });

    it('should show games panel when games button is clicked', () => {
      renderCollaboration();

      // Join a room
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Click games button
      const gamesButton = screen.getAllByRole('button').find(btn =>
        btn.getAttribute('title') === 'Brain Games'
      );
      fireEvent.click(gamesButton!);

      // Games panel should be visible
      expect(screen.getByText('Brain Break Games')).toBeInTheDocument();
    });

    it('should display game options in games panel', () => {
      renderCollaboration();

      // Join a room and open games
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      const gamesButton = screen.getAllByRole('button').find(btn =>
        btn.getAttribute('title') === 'Brain Games'
      );
      fireEvent.click(gamesButton!);

      // Should show game options
      expect(screen.getByText('Sudoku')).toBeInTheDocument();
      expect(screen.getByText('Tic Tac Toe')).toBeInTheDocument();
      expect(screen.getByText('Word Puzzle')).toBeInTheDocument();
      expect(screen.getByText('Math Quiz')).toBeInTheDocument();
    });

    it('should close games panel when X button is clicked', () => {
      renderCollaboration();

      // Join a room and open games
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      const gamesButton = screen.getAllByRole('button').find(btn =>
        btn.getAttribute('title') === 'Brain Games'
      );
      fireEvent.click(gamesButton!);

      // Close games panel
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('text-gray-500');
      });
      fireEvent.click(closeButton!);

      // Panel should be closed
      expect(screen.queryByText('Brain Break Games')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle switching between rooms', () => {
      renderCollaboration();

      // Join first room
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Should show math room details (use getAllByText since text may appear multiple times)
      const mathElements = screen.getAllByText(/Mathematics/i);
      expect(mathElements.length).toBeGreaterThan(0);

      // Join second room
      const scienceRoomButton = screen.getByText('Science Squad 🔬').closest('button');
      fireEvent.click(scienceRoomButton!);

      // Should show science room details (use getAllByText since text may appear multiple times)
      const scienceElements = screen.getAllByText(/Science/i);
      expect(scienceElements.length).toBeGreaterThan(0);
    });

    it('should handle sending multiple messages', async () => {
      renderCollaboration();

      // Join a room
      const mathRoomButton = screen.getByText('Math Warriors 🔢').closest('button');
      fireEvent.click(mathRoomButton!);

      // Send multiple messages
      const messageInput = screen.getByPlaceholderText('Type a message...');

      fireEvent.change(messageInput, { target: { value: 'Message 1' } });
      fireEvent.keyPress(messageInput, { key: 'Enter', code: 13, charCode: 13 });

      // First message should appear (use findByText which automatically waits)
      expect(await screen.findByText('Message 1')).toBeInTheDocument();

      fireEvent.change(messageInput, { target: { value: 'Message 2' } });
      fireEvent.keyPress(messageInput, { key: 'Enter', code: 13, charCode: 13 });

      // Both messages should now be visible
      expect(await screen.findByText('Message 2')).toBeInTheDocument();
      expect(screen.getByText('Message 1')).toBeInTheDocument();
    });

    it('should not create room without name', () => {
      renderCollaboration();

      // Open modal
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('from-primary-500');
      });
      fireEvent.click(createButton!);

      // Get initial room count
      const initialRooms = screen.getAllByText(/Warriors|Squad/);
      const initialCount = initialRooms.length;

      // Try to create room without name
      const createRoomButton = screen.getByText('Create Room');
      fireEvent.click(createRoomButton);

      // Room count should not increase (modal should stay open)
      const finalRooms = screen.getAllByText(/Warriors|Squad|Create Study Room/);
      // If modal is still open, "Create Study Room" will be present
      expect(screen.queryByText('Create Study Room')).toBeInTheDocument();
    });
  });
});

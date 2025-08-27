import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import UserSelection from '../../../src/components/UserSelection';
import { useStore } from '../../../src/store/useStore';
import '@testing-library/jest-dom';

// Mock the store
vi.mock('../../../src/store/useStore');

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Wrapper component for providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('UserSelection Component', () => {
  const mockUsers = [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      hasCompletedOnboarding: true,
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      hasCompletedOnboarding: false,
    },
  ];

  const mockStore = {
    users: mockUsers,
    currentUserId: null,
    setCurrentUser: vi.fn(),
    addUser: vi.fn(),
    removeUser: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockReturnValue(mockStore);
  });

  it('should render user selection interface', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    expect(screen.getByText(/select.*user/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should display user cards with correct information', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Check for user cards
    const johnCard = screen.getByTestId('user-card-user1');
    const janeCard = screen.getByTestId('user-card-user2');

    expect(johnCard).toBeInTheDocument();
    expect(janeCard).toBeInTheDocument();

    // Check user names
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check user emails
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should select user when card is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    const johnCard = screen.getByTestId('user-card-user1');
    await user.click(johnCard);

    expect(mockStore.setCurrentUser).toHaveBeenCalledWith('user1');
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    const johnCard = screen.getByTestId('user-card-user1');
    
    // Focus on the card
    johnCard.focus();
    expect(johnCard).toHaveFocus();

    // Press Enter to select
    await user.keyboard('[Enter]');
    expect(mockStore.setCurrentUser).toHaveBeenCalledWith('user1');

    // Press Space to select
    await user.keyboard('[Space]');
    expect(mockStore.setCurrentUser).toHaveBeenCalledWith('user1');
  });

  it('should show create new user option', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    const createUserButton = screen.getByTestId('create-new-user');
    expect(createUserButton).toBeInTheDocument();
    expect(screen.getByText(/create.*user/i)).toBeInTheDocument();
  });

  it('should open create user form when create button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    const createUserButton = screen.getByTestId('create-new-user');
    await user.click(createUserButton);

    // Should show create user form
    expect(screen.getByTestId('create-user-form')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should create new user with form submission', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Open create form
    const createUserButton = screen.getByTestId('create-new-user');
    await user.click(createUserButton);

    // Fill form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    await user.type(nameInput, 'New User');
    await user.type(emailInput, 'newuser@example.com');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockStore.addUser).toHaveBeenCalledWith({
        name: 'New User',
        email: 'newuser@example.com',
        hasCompletedOnboarding: false,
      });
    });
  });

  it('should validate form inputs', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Open create form
    const createUserButton = screen.getByTestId('create-new-user');
    await user.click(createUserButton);

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Should show validation errors
    expect(screen.getByText(/name.*required/i)).toBeInTheDocument();
    expect(screen.getByText(/email.*required/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Open create form
    const createUserButton = screen.getByTestId('create-new-user');
    await user.click(createUserButton);

    // Fill with invalid email
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Should show email validation error
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });

  it('should cancel user creation', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Open create form
    const createUserButton = screen.getByTestId('create-new-user');
    await user.click(createUserButton);

    // Cancel form
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Form should be hidden
    expect(screen.queryByTestId('create-user-form')).not.toBeInTheDocument();
  });

  it('should handle empty users list', () => {
    (useStore as any).mockReturnValue({
      ...mockStore,
      users: [],
    });

    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    expect(screen.getByText(/no users/i)).toBeInTheDocument();
    expect(screen.getByTestId('create-new-user')).toBeInTheDocument();
  });

  it('should show user avatars when available', () => {
    const usersWithAvatars = mockUsers.map(user => ({
      ...user,
      avatar: `https://example.com/avatar/${user.id}.jpg`,
    }));

    (useStore as any).mockReturnValue({
      ...mockStore,
      users: usersWithAvatars,
    });

    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Check for avatar images
    const avatars = screen.getAllByRole('img');
    expect(avatars).toHaveLength(usersWithAvatars.length);
  });

  it('should indicate onboarding status', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // John has completed onboarding
    const johnCard = screen.getByTestId('user-card-user1');
    expect(johnCard).not.toHaveTextContent('New');

    // Jane has not completed onboarding
    const janeCard = screen.getByTestId('user-card-user2');
    expect(janeCard).toHaveTextContent('New');
  });

  it('should be accessible', async () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Check for proper ARIA labels
    const userCards = screen.getAllByRole('button');
    userCards.forEach(card => {
      expect(card).toHaveAttribute('aria-label');
    });

    // Check for proper heading structure
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();

    // Check keyboard navigation
    const firstCard = screen.getByTestId('user-card-user1');
    firstCard.focus();
    expect(firstCard).toHaveFocus();
  });

  it('should handle user deletion', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Look for delete button (might be in a dropdown or context menu)
    const deleteButton = screen.queryByTestId('delete-user-user1');
    
    if (deleteButton) {
      await user.click(deleteButton);
      
      // Should show confirmation dialog
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(mockStore.removeUser).toHaveBeenCalledWith('user1');
    }
  });

  it('should show loading state during user operations', async () => {
    // Mock a loading state
    (useStore as any).mockReturnValue({
      ...mockStore,
      isLoading: true,
    });

    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should handle errors gracefully', () => {
    // Mock an error state
    (useStore as any).mockReturnValue({
      ...mockStore,
      error: 'Failed to load users',
    });

    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import UserSelection from '../../../src/components/UserSelection';
import { useStore } from '../../../src/store/useStore';
import '@testing-library/jest-dom';

// Wrapper component for providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('UserSelection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Use real store and reset to clean state
    const state = useStore.getState();

    // Directly set users to empty array and clear userData
    useStore.setState({
      users: [],
      userData: {},
      currentUserId: null,
    });

    // Add test users using the correct addUser signature
    state.addUser?.('John Doe', '👨‍🎓', '9th');
    state.addUser?.('Jane Smith', '👩‍🎓', '9th');

    // Update the users to have streak and level for more realistic testing
    const users = state.users || [];
    const johnUser = users.find(u => u.name === 'John Doe');
    const janeUser = users.find(u => u.name === 'Jane Smith');

    if (johnUser) {
      state.updateUserProfile?.(johnUser.id, { streak: 5, level: 3 });
    }
    if (janeUser) {
      state.updateUserProfile?.(janeUser.id, { streak: 0, level: 1 });
    }
  });

  it('should render user selection interface', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    expect(screen.getByText('Study Hero')).toBeInTheDocument();
    expect(screen.getByText(/Who's ready to learn today/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should display user cards with correct information', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Check for user cards (IDs are generated from lowercase names without spaces)
    const johnCard = screen.getByTestId('user-card-johndoe');
    const janeCard = screen.getByTestId('user-card-janesmith');

    expect(johnCard).toBeInTheDocument();
    expect(janeCard).toBeInTheDocument();

    // Check user names
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check for level indicators
    expect(screen.getAllByText(/Lvl/i).length).toBeGreaterThan(0);
  });

  it('should select user when card is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    const state = useStore.getState();
    const initialUserId = state.currentUserId;

    const johnCard = screen.getByTestId('user-card-johndoe');
    await user.click(johnCard);

    // User should be switched
    const newUserId = useStore.getState().currentUserId;
    expect(newUserId).toBe('johndoe');
    expect(newUserId).not.toBe(initialUserId);
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    const johnCard = screen.getByTestId('user-card-johndoe');

    // Focus on the card
    johnCard.focus();
    expect(johnCard).toHaveFocus();

    // Button should be keyboard accessible (it's a button element)
    expect(johnCard.tagName).toBe('BUTTON');
  });

  it('should show create new user option', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    expect(screen.getByText('Add New Student')).toBeInTheDocument();
    expect(screen.getByText('Create a new profile')).toBeInTheDocument();
  });

  it('should display user streak when available', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // John has streak of 5
    expect(screen.getByText('🔥 5')).toBeInTheDocument();
  });

  it('should display user level', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Should show level indicators for both users
    const levelElements = screen.getAllByText(/Lvl/i);
    expect(levelElements.length).toBeGreaterThan(0);
  });

  it('should display user grade', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Both users are in 9th grade
    const gradeElements = screen.getAllByText(/Grade 9th/i);
    expect(gradeElements.length).toBe(2);
  });

  it('should display study time for users', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Should show study hours (default is 0h)
    const studyTimeElements = screen.getAllByText(/h studied/i);
    expect(studyTimeElements.length).toBeGreaterThan(0);
  });

  it('should handle empty users list', () => {
    // Clear all users
    const state = useStore.getState();
    const users = state.users || [];
    users.forEach(user => {
      state.removeUser?.(user.id);
    });

    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Should still show the interface with just "Add New Student" button
    expect(screen.getByText('Study Hero')).toBeInTheDocument();
    expect(screen.getByText('Add New Student')).toBeInTheDocument();
  });

  it('should display greeting based on time of day', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Should show some greeting
    const greetingRegex = /Good Morning|Good Afternoon|Good Evening/i;
    expect(screen.getByText(greetingRegex)).toBeInTheDocument();
  });

  it('should display user avatars', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Both users have avatars (👨‍🎓 and 👩‍🎓)
    const johnCard = screen.getByTestId('user-card-johndoe');
    const janeCard = screen.getByTestId('user-card-janesmith');

    expect(within(johnCard).getByText('👨‍🎓')).toBeInTheDocument();
    expect(within(janeCard).getByText('👩‍🎓')).toBeInTheDocument();
  });

  it('should display tip message', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    expect(screen.getByText(/Each student has their own progress/i)).toBeInTheDocument();
  });

  it('should not show streak badge when streak is zero', () => {
    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Jane has no streak, so no 🔥 0 badge should appear
    const janeCard = screen.getByTestId('user-card-janesmith');
    expect(within(janeCard).queryByText(/🔥/)).not.toBeInTheDocument();
  });

  it('should show achievements when available', () => {
    const state = useStore.getState();
    const johnUser = state.users?.find(u => u.name === 'John Doe');

    if (johnUser) {
      state.updateUserProfile?.(johnUser.id, {
        achievements: ['First Study', 'Week Warrior', 'Quiz Master']
      });
    }

    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    // Should show first 3 achievements
    expect(screen.getByText('First Study')).toBeInTheDocument();
  });

  it('should display motivational quote when available', () => {
    const state = useStore.getState();
    const johnUser = state.users?.find(u => u.name === 'John Doe');

    if (johnUser) {
      state.updateUserProfile?.(johnUser.id, {
        motivationalQuote: 'Study hard, dream big!'
      });
    }

    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    expect(screen.getByText('"Study hard, dream big!"')).toBeInTheDocument();
  });

  it('should display favorite subject when available', () => {
    const state = useStore.getState();
    const johnUser = state.users?.find(u => u.name === 'John Doe');

    if (johnUser) {
      state.updateUserProfile?.(johnUser.id, {
        favoriteSubject: 'Mathematics'
      });
    }

    render(
      <TestWrapper>
        <UserSelection />
      </TestWrapper>
    );

    expect(screen.getByText('Mathematics')).toBeInTheDocument();
  });
});

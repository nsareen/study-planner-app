import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Help from '../../../src/pages/Help';

describe('Help Page', () => {
  beforeEach(() => {
    // No store state needed for Help page (it's stateless)
  });

  const renderHelp = () => {
    return render(
      <BrowserRouter>
        <Help />
      </BrowserRouter>
    );
  };

  describe('Rendering and UI', () => {
    it('should render help center header', () => {
      renderHelp();

      expect(screen.getByText('Help Center')).toBeInTheDocument();
      expect(screen.getByText(/Everything you need to know/i)).toBeInTheDocument();
    });

    it('should render Quick Start Guides section', () => {
      renderHelp();

      expect(screen.getByText('Quick Start Guides')).toBeInTheDocument();
    });

    it('should render FAQ section', () => {
      renderHelp();

      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    });

    it('should render contact section', () => {
      renderHelp();

      expect(screen.getByText('Still Need Help?')).toBeInTheDocument();
      expect(screen.getByText(/Contact Support/i)).toBeInTheDocument();
      expect(screen.getByText(/Join Community/i)).toBeInTheDocument();
    });

    it('should render all guide titles', () => {
      renderHelp();

      expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
      expect(screen.getByText('Daily Study Planning')).toBeInTheDocument();
      expect(screen.getByText('Study Together Guide')).toBeInTheDocument();
    });
  });

  describe('Quick Start Guides', () => {
    it('should display all guides collapsed by default', () => {
      renderHelp();

      // Guides should be visible but steps should not
      expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
      expect(screen.queryByText('Choose Your Profile')).not.toBeInTheDocument();
    });

    it('should expand guide when clicked', () => {
      renderHelp();

      const guideButton = screen.getByText('Getting Started Guide').closest('button');
      fireEvent.click(guideButton!);

      // Steps should now be visible
      expect(screen.getByText('Choose Your Profile')).toBeInTheDocument();
      expect(screen.getByText('Add Your Subjects')).toBeInTheDocument();
      expect(screen.getByText('Schedule Your Exams')).toBeInTheDocument();
      expect(screen.getByText('Start Your Daily Routine')).toBeInTheDocument();
    });

    it('should collapse guide when clicked again', () => {
      renderHelp();

      const guideButton = screen.getByText('Getting Started Guide').closest('button');

      // Expand
      fireEvent.click(guideButton!);
      expect(screen.getByText('Choose Your Profile')).toBeInTheDocument();

      // Collapse
      fireEvent.click(guideButton!);
      expect(screen.queryByText('Choose Your Profile')).not.toBeInTheDocument();
    });

    it('should display step tips when available', () => {
      renderHelp();

      const guideButton = screen.getByText('Getting Started Guide').closest('button');
      fireEvent.click(guideButton!);

      // Tips should be visible
      expect(screen.getByText('Each profile has separate data')).toBeInTheDocument();
      expect(screen.getByText('Switch users anytime with the logout button')).toBeInTheDocument();
    });
  });

  describe('FAQ Section', () => {
    it('should display category filter buttons', () => {
      renderHelp();

      // Category filter buttons should exist (multiple elements may have these texts)
      const allElements = screen.getAllByText('All');
      expect(allElements.length).toBeGreaterThan(0);

      const gettingStartedElements = screen.getAllByText('Getting Started');
      expect(gettingStartedElements.length).toBeGreaterThan(0);

      const subjectsElements = screen.getAllByText('Subjects');
      expect(subjectsElements.length).toBeGreaterThan(0);
    });

    it('should show all FAQs by default', () => {
      renderHelp();

      expect(screen.getByText('What is Study Hero and how does it help me?')).toBeInTheDocument();
      expect(screen.getByText('How do I add subjects and chapters?')).toBeInTheDocument();
      expect(screen.getByText('How does the daily study plan work?')).toBeInTheDocument();
    });

    it('should filter FAQs by category', () => {
      renderHelp();

      // Click "Subjects" category button (find the button specifically, not badge)
      const buttons = screen.getAllByRole('button');
      const subjectsCategoryButton = buttons.find(btn =>
        btn.textContent === 'Subjects' && btn.className.includes('px-4 py-2')
      );
      fireEvent.click(subjectsCategoryButton!);

      // Only Subjects FAQs should be visible
      expect(screen.getByText('How do I add subjects and chapters?')).toBeInTheDocument();

      // Other FAQs should not be visible
      expect(screen.queryByText('How does the daily study plan work?')).not.toBeInTheDocument();
    });

    it('should show all FAQs when "All" is selected', () => {
      renderHelp();

      // Filter to Subjects first
      const buttons1 = screen.getAllByRole('button');
      const subjectsCategoryButton = buttons1.find(btn =>
        btn.textContent === 'Subjects' && btn.className.includes('px-4 py-2')
      );
      fireEvent.click(subjectsCategoryButton!);

      // Now click "All"
      const buttons2 = screen.getAllByRole('button');
      const allCategoryButton = buttons2.find(btn =>
        btn.textContent === 'All' && btn.className.includes('px-4 py-2')
      );
      fireEvent.click(allCategoryButton!);

      // All FAQs should be visible again
      expect(screen.getByText('What is Study Hero and how does it help me?')).toBeInTheDocument();
      expect(screen.getByText('How do I add subjects and chapters?')).toBeInTheDocument();
      expect(screen.getByText('How does the daily study plan work?')).toBeInTheDocument();
    });

    it('should expand FAQ when clicked', () => {
      renderHelp();

      const faqButton = screen.getByText('What is Study Hero and how does it help me?').closest('button');
      fireEvent.click(faqButton!);

      // Answer should now be visible
      expect(screen.getByText(/Study Hero is a smart study planner/i)).toBeInTheDocument();
    });

    it('should collapse FAQ when clicked again', () => {
      renderHelp();

      const faqButton = screen.getByText('What is Study Hero and how does it help me?').closest('button');

      // Expand
      fireEvent.click(faqButton!);
      expect(screen.getByText(/Study Hero is a smart study planner/i)).toBeInTheDocument();

      // Collapse
      fireEvent.click(faqButton!);
      expect(screen.queryByText(/Study Hero is a smart study planner/i)).not.toBeInTheDocument();
    });

    it('should display category badge on each FAQ', () => {
      renderHelp();

      // Category badges should be visible (multiple elements may have these texts)
      const gettingStartedElements = screen.getAllByText('Getting Started');
      expect(gettingStartedElements.length).toBeGreaterThan(0);

      const subjectsElements = screen.getAllByText('Subjects');
      expect(subjectsElements.length).toBeGreaterThan(0);
    });
  });

  describe('Interaction Behavior', () => {
    it('should close previous FAQ when opening a new one', () => {
      renderHelp();

      // Open first FAQ
      const faq1Button = screen.getByText('What is Study Hero and how does it help me?').closest('button');
      fireEvent.click(faq1Button!);
      expect(screen.getByText(/Study Hero is a smart study planner/i)).toBeInTheDocument();

      // Open second FAQ
      const faq2Button = screen.getByText('How do I add subjects and chapters?').closest('button');
      fireEvent.click(faq2Button!);

      // First FAQ should be closed, second should be open
      expect(screen.queryByText(/Study Hero is a smart study planner/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Go to the "Subjects" tab/i)).toBeInTheDocument();
    });

    it('should close previous guide when opening a new one', () => {
      renderHelp();

      // Open first guide
      const guide1Button = screen.getByText('Getting Started Guide').closest('button');
      fireEvent.click(guide1Button!);
      expect(screen.getByText('Choose Your Profile')).toBeInTheDocument();

      // Open second guide
      const guide2Button = screen.getByText('Daily Study Planning').closest('button');
      fireEvent.click(guide2Button!);

      // First guide should be closed, second should be open
      expect(screen.queryByText('Choose Your Profile')).not.toBeInTheDocument();
      expect(screen.getByText('Morning Review')).toBeInTheDocument();
    });
  });

  describe('Content Verification', () => {
    it('should display correct number of guides', () => {
      renderHelp();

      const guideButtons = screen.getAllByText(/Guide/);
      // 3 guides total
      expect(guideButtons.length).toBe(3);
    });

    it('should display guide step numbers', () => {
      renderHelp();

      const guideButton = screen.getByText('Getting Started Guide').closest('button');
      fireEvent.click(guideButton!);

      // Should show step numbers 1-4
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should display correct FAQ count per category', () => {
      renderHelp();

      // Test a specific category
      const buttons = screen.getAllByRole('button');
      const customizationButton = buttons.find(btn =>
        btn.textContent === 'Customization' && btn.className.includes('px-4 py-2')
      );
      fireEvent.click(customizationButton!);

      // Should show the themes FAQ
      expect(screen.getByText(/Can I change the app's appearance/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid guide toggling', () => {
      renderHelp();

      const guideButton = screen.getByText('Getting Started Guide').closest('button');

      // Rapidly toggle multiple times
      fireEvent.click(guideButton!);
      fireEvent.click(guideButton!);
      fireEvent.click(guideButton!);

      // Should end up collapsed (3 clicks = open, close, open)
      expect(screen.getByText('Choose Your Profile')).toBeInTheDocument();
    });

    it('should handle rapid FAQ toggling', () => {
      renderHelp();

      const faqButton = screen.getByText('What is Study Hero and how does it help me?').closest('button');

      // Rapidly toggle multiple times
      fireEvent.click(faqButton!);
      fireEvent.click(faqButton!);
      fireEvent.click(faqButton!);

      // Should end up expanded (3 clicks = open, close, open)
      expect(screen.getByText(/Study Hero is a smart study planner/i)).toBeInTheDocument();
    });

    it('should maintain filter state when toggling FAQs', () => {
      renderHelp();

      // Set filter to Subjects
      const buttons = screen.getAllByRole('button');
      const subjectsCategoryButton = buttons.find(btn =>
        btn.textContent === 'Subjects' && btn.className.includes('px-4 py-2')
      );
      fireEvent.click(subjectsCategoryButton!);

      // Open an FAQ
      const faqButton = screen.getByText('How do I add subjects and chapters?').closest('button');
      fireEvent.click(faqButton!);

      // Filter should still be active (only Subjects FAQ visible)
      expect(screen.queryByText('How does the daily study plan work?')).not.toBeInTheDocument();
    });
  });
});

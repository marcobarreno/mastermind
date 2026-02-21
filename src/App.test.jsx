import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Play: () => <div data-testid="play-icon" />,
  Brain: () => <div data-testid="brain-icon" />,
  User: () => <div data-testid="user-icon" />,
  Trophy: () => <div data-testid="trophy-icon" />,
  XCircle: () => <div data-testid="xcircle-icon" />,
  RotateCcw: () => <div data-testid="rotateccw-icon" />,
  Check: () => <div data-testid="check-icon" />,
  HelpCircle: () => <div data-testid="helpcircle-icon" />,
  Users: () => <div data-testid="users-icon" />,
  EyeOff: () => <div data-testid="eyeoff-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  AlertCircle: () => <div data-testid="alertcircle-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
}));

describe('Mastermind Game Modes', () => {
  it('Single Player mode starts with playing phase', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Single Player'));
    expect(screen.getByText(/Turn 1 \/ 10/i)).toBeInTheDocument();
  });

  it('Two Player Duel starts with setup phase', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Two Player Duel'));
    expect(screen.getByText(/Set Secret Code/i)).toBeInTheDocument();
  });

  it('AI Challenge should start with setup phase and NOT start guessing automatically', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('AI Challenge'));
    
    // It should be in the setup phase
    expect(screen.getByText(/Set Secret Code/i)).toBeInTheDocument();
    
    // Wait for the AI to potentially start guessing (the bug)
    // We use a shorter timeout here to catch the first transition if it happens
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // If the bug is present, the AI will have called submitTurn, 
    // which transitions to phase 'playing' and shows "Turn 1 / 10" (or Turn 2/10)
    // We expect it to NOT be there.
    expect(screen.queryByText(/Turn \d+ \/ 10/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Set Secret Code/i)).toBeInTheDocument();
  });
});

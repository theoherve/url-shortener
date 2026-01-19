import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UrlForm } from './UrlForm';
import * as api from '../services/api';

// Mock the API module
vi.mock('../services/api', () => ({
  createShortUrl: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(public statusCode: number, message: string) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

describe('UrlForm', () => {
  const mockOnUrlCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with input and submit button', () => {
    render(<UrlForm onUrlCreated={mockOnUrlCreated} />);

    expect(screen.getByLabelText(/enter your url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /shorten url/i })).toBeInTheDocument();
  });

  it('shows validation error for empty submission', async () => {
    const user = userEvent.setup();
    render(<UrlForm onUrlCreated={mockOnUrlCreated} />);

    await user.click(screen.getByRole('button', { name: /shorten url/i }));

    expect(screen.getByText(/url is required/i)).toBeInTheDocument();
  });

  it('shows validation error for non-http/https URLs', async () => {
    const user = userEvent.setup();
    render(<UrlForm onUrlCreated={mockOnUrlCreated} />);

    await user.type(screen.getByLabelText(/enter your url/i), 'ftp://example.com');
    await user.click(screen.getByRole('button', { name: /shorten url/i }));

    expect(screen.getByText(/must start with http/i)).toBeInTheDocument();
  });

  it('submits valid URL and shows shortened result', async () => {
    const user = userEvent.setup();
    const mockUrl = {
      id: '123',
      shortCode: 'abc123',
      originalUrl: 'https://example.com/long-url',
      shortUrl: 'http://localhost:3000/abc123',
      createdAt: new Date().toISOString(),
    };

    vi.mocked(api.createShortUrl).mockResolvedValue(mockUrl);

    render(<UrlForm onUrlCreated={mockOnUrlCreated} />);

    await user.type(
      screen.getByLabelText(/enter your url/i),
      'https://example.com/long-url',
    );
    await user.click(screen.getByRole('button', { name: /shorten url/i }));

    await waitFor(() => {
      expect(screen.getByText(/http:\/\/localhost:3000\/abc123/)).toBeInTheDocument();
    });

    expect(mockOnUrlCreated).toHaveBeenCalledWith(mockUrl);
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.mocked(api.createShortUrl).mockReturnValue(promise as any);

    render(<UrlForm onUrlCreated={mockOnUrlCreated} />);

    await user.type(
      screen.getByLabelText(/enter your url/i),
      'https://example.com',
    );
    await user.click(screen.getByRole('button', { name: /shorten url/i }));

    expect(screen.getByRole('button', { name: /shortening/i })).toBeDisabled();

    // Resolve the promise to clean up
    resolvePromise!({
      id: '123',
      shortCode: 'abc123',
      originalUrl: 'https://example.com',
      shortUrl: 'http://localhost:3000/abc123',
      createdAt: new Date().toISOString(),
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    
    vi.mocked(api.createShortUrl).mockRejectedValue(
      new api.ApiError(400, 'Invalid URL format'),
    );

    render(<UrlForm onUrlCreated={mockOnUrlCreated} />);

    await user.type(
      screen.getByLabelText(/enter your url/i),
      'https://example.com',
    );
    await user.click(screen.getByRole('button', { name: /shorten url/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid url format/i)).toBeInTheDocument();
    });
  });
});

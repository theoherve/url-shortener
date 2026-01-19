import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UrlList } from './UrlList';
import type { Url } from '../types/url';

describe('UrlList', () => {
  const mockUrls: Url[] = [
    {
      id: '1',
      shortCode: 'abc123',
      originalUrl: 'https://example1.com/very-long-url-that-needs-truncation',
      shortUrl: 'http://localhost:3000/abc123',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      shortCode: 'def456',
      originalUrl: 'https://example2.com',
      shortUrl: 'http://localhost:3000/def456',
      createdAt: '2024-01-14T09:00:00Z',
    },
  ];

  it('renders loading state', () => {
    render(<UrlList urls={[]} isLoading={true} total={0} />);

    expect(screen.getByText(/loading urls/i)).toBeInTheDocument();
  });

  it('renders empty state when no URLs', () => {
    render(<UrlList urls={[]} isLoading={false} total={0} />);

    expect(screen.getByText(/no urls yet/i)).toBeInTheDocument();
    expect(screen.getByText(/create your first shortened url/i)).toBeInTheDocument();
  });

  it('renders list of URLs', () => {
    render(<UrlList urls={mockUrls} isLoading={false} total={2} />);

    expect(screen.getByText(/your urls/i)).toBeInTheDocument();
    expect(screen.getByText(/2 links/i)).toBeInTheDocument();
    expect(screen.getByText(/http:\/\/localhost:3000\/abc123/)).toBeInTheDocument();
    expect(screen.getByText(/http:\/\/localhost:3000\/def456/)).toBeInTheDocument();
  });

  it('displays correct total count', () => {
    render(<UrlList urls={mockUrls} isLoading={false} total={42} />);

    expect(screen.getByText(/42 links/i)).toBeInTheDocument();
  });

  it('displays singular "link" for single URL', () => {
    render(<UrlList urls={[mockUrls[0]]} isLoading={false} total={1} />);

    expect(screen.getByText(/1 link$/i)).toBeInTheDocument();
  });

  it('renders URLs with accessible links', () => {
    render(<UrlList urls={mockUrls} isLoading={false} total={2} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'http://localhost:3000/abc123');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

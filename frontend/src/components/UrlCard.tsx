import { useState } from 'react';
import { Button } from './Button';
import type { Url } from '../types/url';

type UrlCardProps = {
  url: Url;
};

export const UrlCard = ({ url }: UrlCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopy();
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateUrl = (urlString: string, maxLength = 50): string => {
    if (urlString.length <= maxLength) return urlString;
    return `${urlString.slice(0, maxLength)}...`;
  };

  return (
    <article className="p-4 bg-surface rounded-lg border border-border hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <a
              href={url.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-hover font-mono text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
              tabIndex={0}
              aria-label={`Open shortened URL: ${url.shortUrl}`}
            >
              {url.shortUrl}
            </a>
          </div>
          <p
            className="text-text-muted text-sm truncate"
            title={url.originalUrl}
          >
            {truncateUrl(url.originalUrl)}
          </p>
          <time
            className="text-text-muted/60 text-xs mt-1 block"
            dateTime={url.createdAt}
          >
            {formatDate(url.createdAt)}
          </time>
        </div>
        <Button
          variant="ghost"
          onClick={handleCopy}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label={copied ? 'Copied!' : `Copy ${url.shortUrl}`}
          className="shrink-0"
        >
          {copied ? (
            <span className="text-success text-sm">Copied!</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </Button>
      </div>
    </article>
  );
};

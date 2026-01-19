import { useState, type FormEvent } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { createShortUrl, ApiError } from '../services/api';
import type { Url } from '../types/url';

type UrlFormProps = {
  onUrlCreated: (url: Url) => void;
};

export const UrlForm = ({ onUrlCreated }: UrlFormProps) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<Url | null>(null);
  const [copied, setCopied] = useState(false);

  const validateUrl = (value: string): boolean => {
    if (!value.trim()) {
      setError('URL is required');
      return false;
    }

    try {
      const urlObj = new URL(value);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setError('URL must start with http:// or https://');
        return false;
      }
    } catch {
      setError('Please enter a valid URL');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateUrl(url)) {
      return;
    }

    setIsLoading(true);
    setError('');
    setCreatedUrl(null);

    try {
      const result = await createShortUrl(url);
      setCreatedUrl(result);
      onUrlCreated(result);
      setUrl('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!createdUrl) return;

    try {
      await navigator.clipboard.writeText(createdUrl.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCopy();
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Enter your URL"
          type="url"
          placeholder="https://example.com/your-long-url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError('');
          }}
          error={error}
          disabled={isLoading}
          aria-label="URL to shorten"
        />
        <Button type="submit" isLoading={isLoading} className="w-full">
          {isLoading ? 'Shortening...' : 'Shorten URL'}
        </Button>
      </form>

      {createdUrl && (
        <div className="mt-6 p-4 bg-surface rounded-lg border border-success/30">
          <p className="text-sm text-text-muted mb-2">Your shortened URL:</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 px-3 py-2 bg-background rounded text-success font-mono text-sm truncate">
              {createdUrl.shortUrl}
            </code>
            <Button
              variant="secondary"
              onClick={handleCopy}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
            >
              {copied ? (
                <span className="text-success">Copied!</span>
              ) : (
                'Copy'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

import { UrlCard } from './UrlCard';
import type { Url } from '../types/url';

type UrlListProps = {
  urls: Url[];
  isLoading: boolean;
  total: number;
};

export const UrlList = ({ urls, isLoading, total }: UrlListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-text-muted">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading URLs...</span>
        </div>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text mb-1">No URLs yet</h3>
        <p className="text-text-muted text-sm">
          Create your first shortened URL above!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">Your URLs</h2>
        <span className="text-sm text-text-muted">
          {total} {total === 1 ? 'link' : 'links'}
        </span>
      </div>
      <div className="space-y-3" role="list" aria-label="List of shortened URLs">
        {urls.map((url) => (
          <UrlCard key={url.id} url={url} />
        ))}
      </div>
    </div>
  );
};

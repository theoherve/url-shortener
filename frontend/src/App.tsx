import { useState, useEffect, useCallback } from 'react';
import { UrlForm } from './components/UrlForm';
import { UrlList } from './components/UrlList';
import { getUrls } from './services/api';
import type { Url } from './types/url';

const App = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUrls = useCallback(async () => {
    try {
      setError(null);
      const data = await getUrls();
      setUrls(data.urls);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load URLs. Please try again.');
      console.error('Error fetching URLs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleUrlCreated = (newUrl: Url) => {
    setUrls((prev) => [newUrl, ...prev]);
    setTotal((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-text mb-2 tracking-tight">
            URL Shortener
          </h1>
          <p className="text-text-muted">
            Raccourcissez vos URLs en un clic
          </p>
        </header>

        <main className="space-y-10">
          <section aria-label="Create shortened URL">
            <UrlForm onUrlCreated={handleUrlCreated} />
          </section>

          {error && (
            <div
              className="p-4 bg-error/10 border border-error/30 rounded-lg text-error text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <section aria-label="URL list">
            <UrlList urls={urls} isLoading={isLoading} total={total} />
          </section>
        </main>

        <footer className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-text-muted text-sm">
            Built for Stoïk - Technical Exercise
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;

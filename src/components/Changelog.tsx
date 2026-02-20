import React, { useState, useEffect } from 'react';
import { Logger } from '../lib/logger';

interface ChangelogProps {
  isDark: boolean;
}



const Changelog: React.FC<ChangelogProps> = ({ isDark }) => {
  const [changelog, setChangelog] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        const response = await fetch(chrome.runtime.getURL('CHANGELOG.md'));
        if (!response.ok) {
          throw new Error('Failed to load changelog');
        }
        const text = await response.text();
        setChangelog(text);
      } catch (err) {
        Logger.error('Error loading changelog:', err);
        setError('Could not load changelog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, []);

  return (
    <div className="changelog-container">
      {loading && (
        <div className={`changelog-message ${isDark ? 'dark' : ''}`}>
          Loading changelog...
        </div>
      )}

      {error && (
        <div className={`changelog-error ${isDark ? 'dark' : ''}`}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className={`changelog-content ${isDark ? 'dark' : ''}`}>
          <div className="changelog-text">
            {changelog.split('\n').map((line: string, i: number) => (
              <React.Fragment key={i}>
                {line.startsWith('# ') ? <h1>{line.substring(2)}</h1> :
                  line.startsWith('## ') ? <h2>{line.substring(3)}</h2> :
                    line.startsWith('### ') ? <h3>{line.substring(4)}</h3> :
                      line.startsWith('- ') ? <li>{line.substring(2)}</li> :
                        line.trim() === '' ? <br /> :
                          <p>{line}</p>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Changelog;

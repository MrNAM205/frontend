import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IntelligenceConsole.css';

type SuggestionType = 'overdue' | 'unresponded' | 'insight' | 'other';

interface Suggestion {
  id: string | number;
  type: SuggestionType;
  category: string; // e.g., Notices, Bills, Affidavits
  message: string;
  action?: string; // route to navigate to, e.g. '/notices'
}

const getIcon = (type: SuggestionType) => {
  switch (type) {
    case 'overdue':
      return '⏳';
    case 'unresponded':
      return '⚠️';
    case 'insight':
      return '🧠';
    default:
      return '✳️';
  }
};

const IntelligenceConsole: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('/api/intelligence/suggestions')
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        // The backend Suggestion model differs from the frontend shape.
        // Normalize server suggestions into the local `Suggestion` shape.
        const mapped: Suggestion[] = (data || []).map((s: any) => {
          const actionType: string = s.action_type || s.actionType || '';
          const type: SuggestionType =
            actionType.includes('endorse') || actionType.includes('overdue')
              ? 'overdue'
              : actionType.includes('follow')
                ? 'unresponded'
                : actionType.includes('insight')
                  ? 'insight'
                  : 'other';

          const actionRoute = (() => {
            if (actionType === 'send_notice' || actionType === 'follow_up')
              return '/notices';
            if (actionType === 'endorse_bill' || actionType === 'endorse')
              return '/endorse';
            if (actionType === 'open_dispatch') return '/dispatch';
            return undefined;
          })();

          return {
            id: s.id,
            type,
            category:
              s.title || s.category || (actionType ? actionType : 'Other'),
            message:
              s.description ||
              s.message ||
              s.title ||
              'No description provided',
            action: actionRoute,
          } as Suggestion;
        });
        setSuggestions(mapped);
      })
      .catch((err) => {
        console.error('Failed to load suggestions:', err);
        setError('Failed to load suggestions');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    suggestions.forEach((s) => set.add(s.category || 'Other'));
    return Array.from(set);
  }, [suggestions]);

  const visible = suggestions.filter(
    (s) => filter === 'All' || s.category === filter,
  );

  return (
    <div className="intelligence-console">
      <header className="intelligence-header">
        <h2>🧠 Sovereign Intelligence Console</h2>
        <div className="intelligence-controls">
          <label>
            Filter:
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {categories.map((c) => (
                <option value={c} key={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section className="intelligence-body">
        {loading && <div className="muted">Loading suggestions…</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && visible.length === 0 && (
          <div className="muted">
            No suggestions at this time. All clear, sovereign.
          </div>
        )}

        <div className="suggestions-panel">
          {visible.map((s) => (
            <div key={s.id} className={`suggestion-card suggestion-${s.type}`}>
              <div className="suggestion-icon">{getIcon(s.type)}</div>
              <div className="suggestion-content">
                <div className="suggestion-meta">
                  <strong className="suggestion-category">{s.category}</strong>
                </div>
                <p className="suggestion-message">{s.message}</p>
                <div className="suggestion-actions">
                  {s.action && (
                    <button
                      className="act-now"
                      onClick={() => {
                        navigate(s.action!);
                      }}
                    >
                      Act Now
                    </button>
                  )}
                  <button
                    className="dismiss"
                    onClick={async () => {
                      // Optimistic UI: remove from local state first
                      const id = s.id;
                      setSuggestions((prev) => prev.filter((x) => x.id !== id));
                      try {
                        const payload = {
                          action: 'dismiss_suggestion',
                          actor: 'user',
                          stage: s.category || 'other',
                          document_url: null,
                        };
                        const res = await fetch(
                          `/api/intelligence/suggestions/${id}/resolve`,
                          {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                          },
                        );
                        if (!res.ok) {
                          throw new Error(`Status ${res.status}`);
                        }
                        // Optionally, we could read the response event
                      } catch (err) {
                        console.error('Failed to dismiss suggestion:', err);
                        setError('Failed to dismiss suggestion');
                        // Rollback optimistic removal
                        // Re-fetch suggestions or re-add the item conservatively
                        // For now, we'll refetch the list
                        setLoading(true);
                        fetch('/api/intelligence/suggestions')
                          .then((r) => r.json())
                          .then((data) => setSuggestions(data || []))
                          .catch(() => {})
                          .finally(() => setLoading(false));
                      }
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default IntelligenceConsole;

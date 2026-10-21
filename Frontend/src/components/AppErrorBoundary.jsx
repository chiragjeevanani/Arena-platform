import { Component } from 'react';

const RELOAD_KEY = 'app_chunk_reload_at';

/** A page's code file failed to load — almost always because a new version was deployed. */
export function isChunkLoadError(error) {
  const msg = String(error?.message || error || '');
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk .* failed|is not a valid JavaScript MIME type|Unable to preload CSS/i.test(msg);
}

/**
 * Reloads the page once to pick up the newly deployed files. Guarded so a genuinely broken
 * deploy can't cause a reload loop (at most one automatic reload per minute).
 */
export function reloadForNewVersion() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 60 * 1000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* storage unavailable — still try one reload */
  }
  window.location.reload();
  return true;
}

/**
 * Without this, any error while rendering unmounts the whole app and leaves a blank white
 * screen (what customers describe as "the app crashed"). Chunk-load errors after a deploy
 * reload the page; anything else shows a recoverable message instead of a blank screen.
 */
export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App error boundary caught:', error, info?.componentStack);
    if (isChunkLoadError(error)) reloadForNewVersion();
  }

  render() {
    if (!this.state.error) return this.props.children;
    const updating = isChunkLoadError(this.state.error);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#FFF1F1', fontFamily: 'Roboto, system-ui, sans-serif' }}>
        <div style={{ maxWidth: 360, width: '100%', background: '#fff', borderRadius: 24, padding: 28, textAlign: 'center', boxShadow: '0 10px 40px rgba(206,32,41,0.08)', border: '1px solid rgba(206,32,41,0.12)' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
            {updating ? 'Updating the app…' : 'Something went wrong'}
          </div>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 8, lineHeight: 1.5 }}>
            {updating
              ? 'A new version is available. Reloading to get the latest screens.'
              : 'This screen hit a problem. Your bookings and payments are safe — please reload.'}
          </p>
          <button
            type="button"
            onClick={() => { try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* ignore */ } window.location.reload(); }}
            style={{ marginTop: 18, width: '100%', padding: '12px 16px', borderRadius: 14, border: 0, background: '#CE2029', color: '#fff', fontWeight: 900, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = '/'; }}
            style={{ marginTop: 10, width: '100%', padding: '10px 16px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 700, fontSize: 12 }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
}

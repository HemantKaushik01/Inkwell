export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div className="skeleton" style={{ height: '180px', marginBottom: '1rem', borderRadius: 'var(--radius-md)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div className="skeleton skeleton-circle" style={{ width: 32, height: 32, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-text short" style={{ marginBottom: '0.3rem' }} />
          <div className="skeleton skeleton-text" style={{ width: '40%', height: '0.75em' }} />
        </div>
      </div>
      <div className="skeleton skeleton-text" style={{ marginBottom: '0.4rem' }} />
      <div className="skeleton skeleton-text medium" style={{ marginBottom: '0.4rem' }} />
      <div className="skeleton skeleton-text short" />
    </div>
  );
}

export function SkeletonText({ lines = 3, lastShort = true }) {
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{ width: lastShort && i === lines - 1 ? '60%' : '100%', marginBottom: '0.5rem' }}
        />
      ))}
    </div>
  );
}

export function SkeletonArticle() {
  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '2rem 0' }}>
      <div className="skeleton" style={{ height: '3rem', marginBottom: '1rem', borderRadius: 'var(--radius-sm)' }} />
      <div className="skeleton skeleton-text short" style={{ width: '40%', margin: '0 auto 2rem' }} />
      <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)', marginBottom: '3rem' }} />
      <SkeletonText lines={6} />
    </div>
  );
}

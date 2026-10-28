export default function WrappedLoading() {
  return (
    <div className="gw-home">
      <div className="gw-bg" aria-hidden="true" />
      <main className="gw-center" role="status">
        <div className="gw-loader" aria-hidden="true">
          {Array.from({ length: 84 }, (_, i) => (
            <i
              key={i}
              style={{
                animationDelay: `${((i % 12) + Math.floor(i / 12)) * 70}ms`,
              }}
            />
          ))}
        </div>
        <h1>Setting up the match…</h1>
        <p>Loading both years. This takes a second.</p>
      </main>
    </div>
  );
}

export default function Loading() {
  return (
    <div
      className="container section"
      aria-busy="true"
      aria-label="Loading properties"
    >
      <div className="skeleton title-skeleton" />
      <div className="property-grid">
        {[1, 2, 3].map((i) => (
          <div className="skeleton card-skeleton" key={i} />
        ))}
      </div>
    </div>
  );
}

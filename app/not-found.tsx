export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 12 }}>404</h1>
        <p style={{ fontSize: 18, color: "#64748b" }}>
          Sorry, the page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}

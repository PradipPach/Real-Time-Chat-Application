export default function Loader({ small = false }) {
  return (
    <div className={small ? "loader-wrap small" : "loader-wrap"}>
      <div className="spinner" role="status" aria-label="Loading" />
    </div>
  );
}

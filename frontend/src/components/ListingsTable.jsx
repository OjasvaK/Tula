import { useMemo, useState } from "react";
import { useListings } from "../hooks/useListings";

export function ListingsTable() {
  const [flaggedOnly, setFlaggedOnly] = useState(true);
  const [search, setSearch] = useState("");
  const { data: listings = [], isLoading, isError, error } = useListings(flaggedOnly);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter(
      (item) =>
        item.product_name.toLowerCase().includes(q) ||
        item.platform.toLowerCase().includes(q)
    );
  }, [listings, search]);

  return (
    <div className="listings-table">
      <div className="table-controls">
        <input
          type="text"
          placeholder="Search product or platform..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => setFlaggedOnly(e.target.checked)}
          />
          Flagged only
        </label>
      </div>

      {isLoading && <p>Loading listings...</p>}
      {isError && <p className="error">Failed to load listings: {error.message}</p>}

      {!isLoading && !isError && (
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Platform</th>
              <th>Missing Fields</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="empty">
                  No listings found.
                </td>
              </tr>
            )}
            {filtered.map((item) => (
              <tr key={item.id} className={item.missing_fields.length ? "flagged" : ""}>
                <td>{item.product_name}</td>
                <td>{item.platform}</td>
                <td>
                  {item.missing_fields.length ? (
                    item.missing_fields.join(", ")
                  ) : (
                    <span className="compliant">Compliant</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

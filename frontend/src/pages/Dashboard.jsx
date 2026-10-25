import { useAuth } from "../context/AuthContext";
import { IngestForm } from "../components/IngestForm";
import { ListingsTable } from "../components/ListingsTable";
import { ViolationChart } from "../components/ViolationChart";

export function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Legal Metrology Compliance Checker</h1>
        <button className="logout-button" onClick={logout}>
          Log out
        </button>
      </header>

      <section>
        <h2>Add a Listing</h2>
        <IngestForm />
      </section>

      <section>
        <h2>Violation Trends</h2>
        <ViolationChart />
      </section>

      <section>
        <h2>Listings</h2>
        <ListingsTable />
      </section>
    </div>
  );
}

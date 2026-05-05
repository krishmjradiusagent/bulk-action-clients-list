import { BulkClientActionsToolbar } from "./components/BulkClientActionsToolbar";
import { Toaster } from "sonner";

export default function App() {
  return (
    <main className="app-shell">
      <section className="prototype-stage">
        <BulkClientActionsToolbar />
      </section>
      <Toaster position="bottom-right" richColors />
    </main>
  );
}

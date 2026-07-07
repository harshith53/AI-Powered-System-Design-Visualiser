import { SystemDesignerShell } from "@/components/system-designer/SystemDesignerShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { defaultBlueprint } from "@/lib/system-data";

export default function Home() {
  return (
    <ErrorBoundary>
      <SystemDesignerShell initialBlueprint={defaultBlueprint} />
    </ErrorBoundary>
  );
}

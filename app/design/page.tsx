import { SystemDesignerShell } from "@/components/system-designer/SystemDesignerShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { defaultBlueprint } from "@/lib/system-data";

export default function DesignPage() {
  return (
    <ErrorBoundary>
      <SystemDesignerShell initialBlueprint={defaultBlueprint} />
    </ErrorBoundary>
  );
}

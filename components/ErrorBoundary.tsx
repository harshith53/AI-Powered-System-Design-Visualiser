"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-dvh w-full flex-col items-center justify-center bg-[#070b11] text-white">
          <div className="max-w-md rounded-lg border border-rose-400/30 bg-rose-400/5 p-6">
            <div className="text-sm font-semibold text-rose-300">Something went wrong</div>
            <div className="mt-2 text-[13px] text-rose-200/60">
              {this.state.error?.message || "An unexpected error occurred"}
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

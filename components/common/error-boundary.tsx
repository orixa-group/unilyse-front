"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border-destructive/40 bg-destructive/5 space-y-3 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
          <p className="text-muted-foreground text-sm">
            {this.state.message ??
              "Le composant a rencontré une erreur inattendue."}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => this.setState({ hasError: false, message: undefined })}
          >
            Réessayer
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

"use client";

import { Component } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
          <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
          <p className="text-muted-foreground text-sm max-w-md text-center">
            {this.state.error?.message ?? "Erreur inattendue"}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Réessayer
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

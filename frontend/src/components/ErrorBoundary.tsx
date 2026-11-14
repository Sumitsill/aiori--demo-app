import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FitPulse frontend caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#16121a] border border-rose-500/30 p-6 rounded-3xl text-rose-300 space-y-3 m-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Something went wrong in this view</h2>
              <p className="text-xs text-rose-300/80 mt-0.5">{this.state.error?.message || 'Unexpected runtime error.'}</p>
            </div>
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-[#251520] hover:bg-[#321c2c] text-rose-200 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


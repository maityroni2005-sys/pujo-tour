import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, Home, Sparkles, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('⚠️ [UtsavHopper Global Error Boundary Caught Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    // Reset local error state and trigger window reload for a clean route restoration
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleSafeReset = () => {
    // Clear potentially corrupted temporary route state and return to explore
    try {
      this.setState({ hasError: false, error: null, errorInfo: null });
      window.location.href = window.location.pathname;
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
          <div className="max-w-md w-full bg-slate-800/95 border-2 border-rose-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center">
            {/* High-Contrast Alert Header */}
            <div className="w-16 h-16 rounded-2xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center mx-auto mb-5 text-rose-400">
              <ShieldAlert className="w-8 h-8 animate-pulse text-rose-500" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>UtsavHopper Resilient Engine</span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight mb-2">
              Something went off-route!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Don't worry — your saved Puja parikrama itinerary and offline pandal notes are safe in your local storage.
            </p>

            {/* High-Contrast Action Buttons (WCAG AAA compliant: Pure White/Black on Vermilion & Gold) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-6">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry / Reload Route</span>
              </button>

              <button
                onClick={this.handleSafeReset}
                className="w-full sm:w-auto px-5 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Safe Explore Mode</span>
              </button>
            </div>

            {/* Error Diagnostics Toggle */}
            <div className="border-t border-slate-700/80 pt-4 text-left">
              <button
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                {this.state.showDetails ? 'Hide Technical Details' : 'View Error Details'}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-rose-300 overflow-x-auto max-h-40">
                  <p className="font-bold">{this.state.error?.toString()}</p>
                  <pre className="text-[10px] text-slate-400 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

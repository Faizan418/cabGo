import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onDismiss, onRetry, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm ${className}`}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium text-rose-900 leading-snug">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-600 p-0.5 rounded-lg transition-colors"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="antialiased min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 font-sans text-gray-900 dark:text-gray-100">
        <div className="max-w-md w-full space-y-8 text-center bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-600 dark:text-red-500"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Critical Error</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              A critical error prevented the application from loading.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-left overflow-auto max-h-40 font-mono text-red-600 dark:text-red-400">
                {error.message}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => reset()}
              className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Try to recover
            </button>
            <a
              href="/"
              className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Reload application
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

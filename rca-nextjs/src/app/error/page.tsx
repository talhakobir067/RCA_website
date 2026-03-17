import { Suspense } from "react";

interface ErrorPageProps {
  searchParams: {
    reason?: string;
  };
}

export default function ErrorPage({ searchParams }: ErrorPageProps) {
  const reason = searchParams.reason || "unknown";

  return (
    <html lang="en">
      <head>
        <title>Application Error | RCA</title>
      </head>
      <body className="bg-red-50 flex items-center justify-center min-h-screen">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">⚠️ Error</h1>

          {reason === "supabase-unavailable" && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Supabase Connection Failed
              </h2>
              <p className="text-gray-600 mb-4">
                The application could not establish a connection to Supabase. This is a critical service required for the application to function properly.
              </p>
              <p className="text-gray-600 mb-6">
                Please ensure that:
              </p>
              <ul className="text-left text-gray-600 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Supabase environment variables are correctly set</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Your Supabase project is active and accessible</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Network connectivity is available</span>
                </li>
              </ul>
            </>
          )}

          {reason !== "supabase-unavailable" && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Something Went Wrong
              </h2>
              <p className="text-gray-600 mb-6">
                An unexpected error has occurred. Please contact the administrator.
              </p>
            </>
          )}

          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}

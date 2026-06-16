import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import {
  isRouteErrorResponse,
  Link,
  useLocation,
  useRouteError,
} from 'react-router-dom';

export default function CustomerRouteErrorPage() {
  const error = useRouteError();
  const location = useLocation();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred while loading this page.';
  let statusLabel = 'Application Error';

  if (isRouteErrorResponse(error)) {
    statusLabel = `${error.status} ${error.statusText}`;

    if (error.status === 404) {
      title = 'Page not found';
      message =
        'The page you are trying to open does not exist, or the link is no longer valid.';
    } else {
      message =
        typeof error.data === 'string'
          ? error.data
          : error.statusText || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  const isOrderStatusPage = location.pathname.includes('/order-status');
  const backHref = location.pathname.startsWith('/r/') ? location.pathname.split('/order-status')[0] : '/';

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-orange-600">
            {statusLabel}
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>

          <p className="mt-3 text-base leading-7 text-slate-600">
            {message}
          </p>

          {isOrderStatusPage ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              The order tracking link may be old, incomplete, or no longer available.
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <Home className="h-4 w-4" />
              Go to Home
            </Link>

            <Link
              to={backHref}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              {isOrderStatusPage ? 'Back to Menu' : 'Try Again'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
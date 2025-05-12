// app/not-found.tsx
import Link from 'next/link';
import '../scss/page/fourzerofour.scss';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="error-code">404</div>
      <h1 className="error-title">Oops! Page Not Found</h1>
      <p className="error-description">
        Looks like this route doesn’t exist. You might be lost in the matrix.
      </p>

      <pre className="error-snippet">
        <code>
{`// 404.tsx
throw new Error('Page not found: /${typeof window !== 'undefined' ? window.location.pathname : ''}')`}
        </code>
      </pre>

      <Link href="/" className="back-home-btn">
        Go back home
      </Link>
    </div>
  );
}

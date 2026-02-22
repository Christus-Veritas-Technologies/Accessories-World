import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Page Not Found — Admin Dashboard',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 px-4">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The admin page you're looking for doesn't exist.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/login"
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-6 rounded-lg transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-red-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin"></div>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading</h2>
        <p className="text-gray-600">Fetching your dashboard data...</p>
      </div>
    </div>
  );
}

export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* Icon */}
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
        <svg
          className="h-9 w-9 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
          />
        </svg>
      </div>

      {/* Brand */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-600">
        Accessories World
      </p>

      {/* Heading */}
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Our blog is getting an upgrade
      </h1>

      {/* Copy */}
      <p className="mb-10 max-w-sm text-base leading-relaxed text-gray-500">
        We&apos;re making some improvements. Check back in a little while —
        new content is on the way.
      </p>

      {/* Divider */}
      <div className="mb-10 h-px w-12 bg-gray-200" />

      {/* Contact */}
      <p className="text-sm text-gray-400">
        Questions?{" "}
        <a
          href="https://wa.me/263784923973"
          className="font-medium text-red-600 hover:underline"
        >
          Message us on WhatsApp
        </a>
      </p>
    </div>
  );
}

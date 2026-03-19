export default function PrivacyBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-warm-green-bg p-4">
      <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-warm-green"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
      <div>
        <p className="text-sm font-medium text-warm-green">
          Your documents never leave your browser
        </p>
        <p className="mt-0.5 text-xs text-warm-body">
          All text extraction and OCR processing happens entirely on your device. No document data is ever sent to any server.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function TermsModal({ onAgree }: { onAgree: () => void }) {
  const [scrollAtBottom, setScrollAtBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
    setScrollAtBottom(atBottom);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center px-4">
      <div className="bg-white max-w-md w-full rounded-xl shadow-2xl p-6 relative overflow-hidden text-gray-800">
        <h2 className="text-xl font-bold mb-2 text-center">TripTask Terms and Conditions</h2>
        <div
          className="overflow-y-auto max-h-[60vh] p-2 border rounded bg-gray-50 text-sm leading-relaxed space-y-3"
          onScroll={handleScroll}
        >
          <p><strong>Effective Date:</strong> July 12, 2025</p>
          <p><strong>INTRODUCTION:</strong> By using TripTask, you agree to these terms. Please do not use the service if you disagree.</p>
          <p><strong>SERVICE:</strong> Connects users with riders for errands such as purchasing or deliveries.</p>
          <p><strong>DELIVERY:</strong> Marked complete once the item is delivered, with photo proof, and status marked &quot;Completed&quot;.</p>
          <p><strong>CANCELLATION:</strong> You can cancel while pending or if no agreement is reached on price after rider accepts.</p>
          <p><strong>PAYMENTS:</strong> Minimum fare is &#8369;40-&#8369;50. Final price is negotiated in chat and paid in cash unless agreed otherwise.</p>
          <p><strong>RESPONSIBILITIES:</strong> Provide accurate info, pay fees, be available, and respect riders.</p>
          <p><strong>PROHIBITED:</strong> No illegal, fraudulent, or harmful use.</p>
          <p><strong>LIMITATIONS:</strong> Not liable for delays or issues unless rider&apos;s fault. Refunds are case-by-case.</p>
          <p><strong>PRIVACY:</strong> We collect basic personal info to deliver service. We do not sell your data. Shared only when needed.</p>
          <p><strong>UPDATES:</strong> Terms may change. You will be notified in the app.</p>
        </div>

        <button
          disabled={!scrollAtBottom}
          onClick={onAgree}
          className={`mt-4 w-full py-2 rounded font-semibold text-white transition ${
            scrollAtBottom ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          I Agree
        </button>
      </div>
    </div>
  );
}

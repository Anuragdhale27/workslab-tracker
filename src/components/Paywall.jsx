import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
// Razorpay placeholder. Set VITE_RAZORPAY_LINK to a Razorpay Payment Link.
// After payment, redirect URL should be https://tracker.workslab.in/?paid=1 — App.jsx can then mark paid.
// NOTE: Client-side flags are not tamper-proof. For real enforcement, verify via Razorpay webhook → Cloud Function later.
export default function Paywall({ onClose, onPaid }) {
  const link = import.meta.env.VITE_RAZORPAY_LINK
  return (
    <div className="fixed inset-0 z-50 bg-ink/60 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white border border-ink max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
        <Lock className="text-accent mb-4" />
        <h2 className="text-2xl font-medium tracking-tight">You've used your 100 free trackers.</h2>
        <p className="mt-3 text-neutral-600 font-light">Unlock unlimited modules for a one-time ₹100. No subscription.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="accent" onClick={() => link && link !== 'PASTE_PAYMENT_LINK_HERE' ? (window.location.href = link) : alert('Payment link not configured yet.')}>Pay ₹100 — unlock forever</Button>
          <Button variant="ghost" onClick={onClose}>Not now</Button>
        </div>
        {import.meta.env.DEV && <button className="mt-4 text-xs underline text-neutral-400" onClick={onPaid}>[dev] mark as paid</button>}
      </div>
    </div>
  )
}

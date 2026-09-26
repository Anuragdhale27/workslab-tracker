import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { PRICING } from '@/config'
import { inr } from '@/lib/utils'
// Razorpay Payment Link with redirect URL https://tracker.workslab.in/?paid=1  (see SETUP.md Part E)
export default function Paywall({ onClose, onPaid }) {
  const link = import.meta.env.VITE_RAZORPAY_LINK
  return (
    <div className="fixed inset-0 z-50 bg-ink/60 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-paper border border-ink max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
        <span className="inline-block bg-accent text-accent-ink text-xs font-medium px-2 py-1 mb-4">Early-bird offer</span>
        <h2 className="text-2xl font-medium tracking-tight">The {PRICING.FOUNDER_SEATS} free seats are gone — but the early-bird price is on.</h2>
        <p className="mt-4 text-4xl font-medium tracking-tight">{inr(PRICING.EARLY_BIRD)} <s className="text-lg font-light text-muted">{inr(PRICING.REGULAR)}</s></p>
        <p className="text-sm text-muted">One-time. Unlimited trackers, all themes, all future modules. No subscription.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="accent" size="lg" onClick={() => link && link !== 'PASTE_PAYMENT_LINK_HERE' ? (window.location.href = link) : alert('Payment link not configured yet.')}>Grab now — {inr(PRICING.EARLY_BIRD)}</Button>
          <Button variant="ghost" onClick={onClose}>Continue with {PRICING.FREE_TRIAL_MODULES} free tracker</Button>
        </div>
        {import.meta.env.DEV && <button className="mt-4 text-xs underline text-muted" onClick={onPaid}>[dev] mark as paid</button>}
      </div>
    </div>
  )
}

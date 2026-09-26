import { Button } from '@/components/ui/button'
import { ShieldCheck, Table2, IndianRupee } from 'lucide-react'

export default function Login({ onSignIn, err }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-12">
      <section className="lg:col-span-7 px-6 py-12 lg:p-20 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-ink">
        <p className="text-xs text-neutral-500 flex items-center gap-2"><span className="w-6 h-px bg-accent" /> Works Lab Tracker</p>
        <div className="py-12">
          <h1 className="text-[clamp(2.4rem,7vw,5.5rem)] leading-[.98] tracking-[-.045em] font-medium max-w-[12ch]">
            Know where your <em className="not-italic text-accent">salary</em> goes.
          </h1>
          <p className="mt-8 text-lg font-light text-neutral-700 max-w-[46ch]">
            Track in-hand salary, EMIs, SIPs and daily spend. Plan weddings, trips and goals. Everything saves to a Google Sheet in <b className="font-medium">your own Drive</b>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={onSignIn}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#fff" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></svg>
              Continue with Google
            </Button>
          </div>
          {err && <p className="mt-4 text-sm text-bad">{err}</p>}
          <p className="mt-4 text-xs text-neutral-500">Free for your first 100 trackers · then ₹100 one-time for unlimited</p>
        </div>
        <ul className="grid sm:grid-cols-3 gap-6 text-sm border-t border-ink pt-6">
          <li className="flex gap-3"><ShieldCheck className="text-accent shrink-0" size={20} /><span><b className="font-medium">You own the data.</b><br /><span className="text-neutral-600 font-light">We only touch the one sheet we create.</span></span></li>
          <li className="flex gap-3"><Table2 className="text-accent shrink-0" size={20} /><span><b className="font-medium">Edit anywhere.</b><br /><span className="text-neutral-600 font-light">Here, or directly in Google Sheets.</span></span></li>
          <li className="flex gap-3"><IndianRupee className="text-accent shrink-0" size={20} /><span><b className="font-medium">Built for India.</b><br /><span className="text-neutral-600 font-light">₹ lakhs, EMIs, SIPs, Swiggy — all first-class.</span></span></li>
        </ul>
      </section>
      <aside className="lg:col-span-5 bg-ink text-white p-6 lg:p-14 flex items-end">
        <div className="w-full border border-white/25 p-6 font-light text-sm">
          <p className="text-accent text-xs mb-4">Sample insight</p>
          <p className="text-2xl leading-snug">"EMIs are 44% of income. Banks flag anything above 40% — avoid new loans."</p>
          <p className="mt-6 text-white/60">Rule-based insights, computed in your browser. Nothing is uploaded to us.</p>
        </div>
      </aside>
    </div>
  )
}

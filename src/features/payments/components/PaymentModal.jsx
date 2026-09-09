import { useState } from "react";
import Icon from "../../../components/ui/Icon";
import { useToast } from "../../../context/ToastContext";

const STAGES = { FORM: "form", PROCESSING: "processing", SUCCESS: "success" };

/**
 * Simulates the Paystack popup checkout. No real payment is processed —
 * this stands in for the paystack.service.js call to the real Paystack API
 * once the backend exists.
 */
export default function PaymentModal({ listing, onClose }) {
  const { showToast } = useToast();
  const [stage, setStage] = useState(STAGES.FORM);
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const depositAmount = Math.round(listing.price * 0.1);

  const update = (field) => (e) => setCard((c) => ({ ...c, [field]: e.target.value }));

  const handlePay = (e) => {
    e.preventDefault();
    setStage(STAGES.PROCESSING);
    setTimeout(() => {
      setStage(STAGES.SUCCESS);
      showToast("Payment successful!");
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={stage === STAGES.FORM ? onClose : undefined}>
      <div onClick={(e) => e.stopPropagation()} className="bg-surface-container-lowest w-full max-w-md rounded-2xl overflow-hidden">
        <div className="p-6 bg-primary text-on-primary flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-primary">Secure Deposit Payment</h3>
            <p className="font-label-sm text-label-sm text-on-primary-container">Powered by Paystack (simulated)</p>
          </div>
          {stage === STAGES.FORM && (
            <button onClick={onClose} className="text-on-primary/80 hover:text-on-primary">
              <Icon name="close" size={24} />
            </button>
          )}
        </div>

        {stage === STAGES.FORM && (
          <form onSubmit={handlePay} className="p-6 flex flex-col gap-4">
            <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Deposit (10% of annual rent)</span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">₦{depositAmount.toLocaleString()}</span>
            </div>

            <Field label="Card Number">
              <input
                required
                value={card.number}
                onChange={update("number")}
                placeholder="4084 0840 8408 4081"
                maxLength={19}
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Expiry">
                <input
                  required
                  value={card.expiry}
                  onChange={update("expiry")}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </Field>
              <Field label="CVV">
                <input
                  required
                  value={card.cvv}
                  onChange={update("cvv")}
                  placeholder="408"
                  maxLength={3}
                  className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </Field>
            </div>

            <button
              type="submit"
              className="w-full h-12 mt-2 rounded-lg bg-secondary hover:bg-sunset-orange text-on-secondary font-label-lg text-label-lg flex items-center justify-center gap-2"
            >
              <Icon name="lock" size={18} />
              Pay ₦{depositAmount.toLocaleString()}
            </button>
            <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
              This is a demo checkout — no real card details are transmitted.
            </p>
          </form>
        )}

        {stage === STAGES.PROCESSING && (
          <div className="p-12 flex flex-col items-center gap-4">
            <Icon name="sync" size={40} className="text-primary animate-spin" />
            <p className="font-label-lg text-label-lg text-on-surface">Processing your payment...</p>
          </div>
        )}

        {stage === STAGES.SUCCESS && (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-verified-green/10 text-verified-green flex items-center justify-center">
              <Icon name="check" size={32} />
            </div>
            <h3 className="font-headline-md text-headline-md text-primary">Payment Successful</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              ₦{depositAmount.toLocaleString()} held in escrow for {listing.title}. Funds release to the landlord after your inspection is confirmed.
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Ref: PP-{Date.now().toString(36).toUpperCase()}</p>
            <button onClick={onClose} className="mt-2 px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label-sm text-label-sm text-on-surface-variant">{label}</label>
      {children}
    </div>
  );
}

import { Link } from "react-router-dom";
import Icon from "../components/Icon";

const valueProps = [
  {
    icon: "shield_lock",
    title: "Verified Listings",
    body: "Every property and landlord undergoes a rigorous verification process to protect you from scams and ensure a secure living environment.",
  },
  {
    icon: "psychology",
    title: "Smart Matching",
    body: "Our AI compatibility scoring pairs you with roommates who share your lifestyle, habits, and preferences for a harmonious home.",
  },
  {
    icon: "chat_bubble",
    title: "Secure Chat",
    body: "Communicate safely within the app. Get to know potential roommates or ask landlords questions without revealing personal contact info early on.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-background text-on-surface">
      <nav className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
        <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <span className="font-display text-display-lg text-primary">PadPair</span>
          <div className="flex gap-4 items-center">
            <Link to="/login" className="hidden md:block font-label-lg text-label-lg text-primary hover:text-primary-container transition-colors px-4">
              Log in
            </Link>
            <Link
              to="/onboarding"
              className="bg-secondary text-on-secondary font-label-lg text-label-lg rounded-full px-6 h-12 flex items-center hover:opacity-90 transition-opacity"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <h1 className="font-display text-display-lg md:text-5xl text-primary leading-tight">Find your safe space.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
            Join Nigeria's most trusted roommate and house rental community. Verified listings, secure searching, and
            compatible matches designed for the modern tenant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/onboarding"
              className="bg-secondary text-on-secondary font-label-lg text-label-lg rounded-full px-8 h-14 flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
          <div className="flex items-center gap-2 mt-4 text-verified-green font-label-lg text-label-lg">
            <Icon name="verified" filled />
            <span>Every listing is 100% verified for your peace of mind.</span>
          </div>
        </div>
        <div className="relative w-full h-[400px] rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80"
            alt="Modern Nigerian living room"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="bg-surface-container-low py-20 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto">
          <h2 className="font-display text-headline-md text-primary mb-4 text-center">Why Choose PadPair?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {valueProps.map((prop) => (
              <div key={prop.title} className="bg-surface rounded-2xl p-8 border border-outline-variant flex flex-col gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Icon name={prop.icon} filled size={28} />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">{prop.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{prop.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

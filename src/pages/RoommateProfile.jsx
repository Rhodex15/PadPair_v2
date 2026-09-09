import { useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import Icon from "../components/Icon";
import InfoPill from "../components/InfoPill";
import { useRoommates } from "../context/RoommatesContext";
import { useAuth } from "../context/AuthContext";
import { useMessages } from "../context/MessagesContext";
import { useToast } from "../context/ToastContext";
import { computeCompatibility, LIFESTYLE_LABELS } from "../utils/compatibility";

const lifestyleDisplay = [
  { key: "cleanliness", icon: "cleaning_services", label: "Cleanliness" },
  { key: "sleepSchedule", icon: "bedtime", label: "Sleep Schedule" },
  { key: "socialLevel", icon: "groups", label: "Social Level" },
  { key: "pets", icon: "pets", label: "Pet Policy" },
];

export default function RoommateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRoommate, savedIds, toggleSaved } = useRoommates();
  const { user } = useAuth();
  const { getOrCreateConversation, sendMessage } = useMessages();
  const { showToast } = useToast();
  const [showChatBox, setShowChatBox] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [intro, setIntro] = useState("");

  const roommate = getRoommate(id);
  if (!roommate) return <Navigate to="/roommates" replace />;

  const isSaved = savedIds.includes(roommate.id);
  const match = computeCompatibility(user?.lifestyle, roommate.lifestyle);
  const firstName = roommate.name.split(" ")[0];

  const handleSendIntro = () => {
    if (!intro.trim()) return;
    const convo = getOrCreateConversation({ id: roommate.id, name: roommate.name, avatar: roommate.image });
    sendMessage(convo.id, intro.trim());
    setShowChatBox(false);
    setIntro("");
    showToast("Message sent!");
    navigate(`/messages/${roommate.id}`);
  };

  const handleReport = () => {
    if (!reportReason.trim()) return;
    setShowReport(false);
    setReportReason("");
    showToast("Report submitted. Trust & Safety will review within 2 hours.", "shield");
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <nav className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant mb-6">
        <button onClick={() => navigate("/roommates")} className="hover:text-primary transition-colors flex items-center gap-1">
          <Icon name="group" size={16} />
          Find a Roommate
        </button>
        <Icon name="chevron_right" size={14} />
        <span className="text-primary font-semibold">{roommate.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            <div className="relative w-full h-[320px]">
              <img src={roommate.image} alt={roommate.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-black/10" />
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                {roommate.verified && <InfoPill icon="verified" label="Verified Resident" tone="verified" />}
                <button
                  aria-label={isSaved ? "Remove bookmark" : "Save profile"}
                  onClick={() => toggleSaved(roommate.id)}
                  className="w-10 h-10 rounded-full bg-surface-container-lowest/90 flex items-center justify-center text-on-surface-variant hover:text-secondary"
                >
                  <Icon name="bookmark" filled={isSaved} className={isSaved ? "text-secondary" : ""} size={20} />
                </button>
              </div>
              <div className="absolute bottom-4 left-5 right-5 text-on-primary">
                <h1 className="font-headline-lg text-headline-lg text-on-primary">
                  {roommate.name}, {roommate.age}
                </h1>
                <p className="font-body-sm text-body-sm text-on-primary-container flex items-center gap-1.5 mt-1">
                  <Icon name="work" size={16} />
                  {roommate.role}
                </p>
                <p className="font-body-sm text-body-sm text-primary-fixed flex items-center gap-1.5 mt-1">
                  <Icon name="location_on" size={16} />
                  {roommate.location}
                </p>
              </div>
            </div>

            <div className="p-6 bg-secondary/5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-headline-sm text-headline-sm font-bold shrink-0">
                {match.score}%
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">Compatibility Match</h2>
                <p className="font-label-sm text-label-sm text-secondary font-semibold">
                  {match.score >= 85 ? "Exceptional match" : match.score >= 65 ? "Strong match" : "Some differences to discuss"}
                </p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-3">
              <button
                onClick={() => setShowChatBox(true)}
                className="w-full h-12 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg hover:bg-sunset-orange transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="chat" size={20} />
                Send Message & Chat
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast("Profile link copied to clipboard!", "link");
                }}
                className="w-full h-12 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="share" size={20} />
                Share Match Profile
              </button>
            </div>
          </div>

          {showChatBox && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-primary">Message {firstName}</h3>
                <button onClick={() => setShowChatBox(false)} className="text-on-surface-variant hover:text-primary">
                  <Icon name="close" size={20} />
                </button>
              </div>
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={4}
                placeholder={`Hi ${firstName}! I noticed our compatibility score is ${match.score}% — would love to connect...`}
                className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <button
                onClick={handleSendIntro}
                className="self-end px-6 py-2.5 rounded-lg bg-secondary hover:bg-sunset-orange text-on-secondary font-label-lg text-label-lg flex items-center gap-2"
              >
                <Icon name="send" size={18} />
                Send Introduction
              </button>
            </div>
          )}

          <div className="p-4 rounded-xl bg-primary/5 flex items-start gap-3">
            <Icon name="lock" size={24} className="text-primary" />
            <div>
              <span className="font-label-lg text-label-lg text-primary block">PadPair Secure Shield</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Phone numbers and exact addresses remain confidential until a mutual lease agreement is signed.
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <Card>
            <SectionHeader icon="person_outline" title={`About ${firstName}`} />
            <p className="font-body-md text-body-md text-on-surface leading-relaxed">{roommate.bio}</p>
          </Card>

          {roommate.description && (
            <Card>
              <SectionHeader icon="description" title="Description" />
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{roommate.description}</p>
            </Card>
          )}

          <Card>
            <SectionHeader icon="tune" title="Lifestyle & Preferences" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lifestyleDisplay.map((field) => (
                <div key={field.key} className="p-5 rounded-xl bg-surface-container-low flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary font-semibold font-label-lg text-label-lg">
                    <Icon name={field.icon} size={20} className="text-secondary" />
                    {field.label}
                  </div>
                  <p className="font-headline-sm text-headline-sm text-on-surface">{LIFESTYLE_LABELS[field.key][roommate.lifestyle[field.key]]}</p>
                </div>
              ))}
              <div className="p-5 rounded-xl bg-surface-container-low flex flex-col gap-2 sm:col-span-2">
                <div className="flex items-center gap-2 text-primary font-semibold font-label-lg text-label-lg">
                  <Icon name="smoking_rooms" size={20} className="text-secondary" />
                  Smoking
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface">{LIFESTYLE_LABELS.smoking[String(roommate.lifestyle.smoking)]}</p>
              </div>
            </div>
          </Card>

          <Card>
            <SectionHeader icon="search_insights" title="Housing & Budget Criteria" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-secondary/5 flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase">Budget</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  ₦{roommate.budget.min.toLocaleString()} – ₦{roommate.budget.max.toLocaleString()}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Per year, per person</span>
              </div>
              <div className="p-5 rounded-xl bg-primary/5 flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary font-bold uppercase">Target Areas</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">{roommate.location.replace("Looking in ", "")}</span>
              </div>
            </div>
          </Card>

          <div className="p-6 rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon name="flag" size={24} className="text-outline" />
              <div>
                <p className="font-label-lg text-label-lg text-on-surface font-semibold">Notice something inaccurate or suspicious?</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Our trust team investigates every report within 2 business hours.</p>
              </div>
            </div>
            <button onClick={() => setShowReport(true)} className="font-label-sm text-label-sm text-error hover:underline font-semibold whitespace-nowrap">
              Report this profile
            </button>
          </div>
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 z-[100] bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReport(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-surface-container-lowest w-full max-w-md rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-primary">Report {roommate.name}</h3>
              <button onClick={() => setShowReport(false)} className="text-on-surface-variant hover:text-primary">
                <Icon name="close" size={20} />
              </button>
            </div>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              placeholder="Describe why you're reporting this profile (e.g. impersonation, unresponsive, inaccurate details)..."
              className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <button onClick={handleReport} className="self-end px-6 py-2.5 rounded-lg bg-error text-on-error font-label-lg text-label-lg">
              Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ children }) {
  return <div className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant flex flex-col gap-5">{children}</div>;
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
        <Icon name={icon} size={22} />
      </div>
      <h2 className="font-headline-md text-headline-md text-primary">{title}</h2>
    </div>
  );
}

import Icon from "../../../components/ui/Icon";

/**
 * @param {{ image: string, name: string, age: number, matchScore: number,
 *   verified?: boolean, bio: string, traits?: string[], isSaved?: boolean,
 *   onToggleSave?: () => void, onViewProfile?: () => void, onStartChat?: () => void }} props
 */
export default function MatchCard({ image, name, age, matchScore, verified, bio, traits = [], isSaved, onToggleSave, onViewProfile, onStartChat }) {
  return (
    <article className="bg-surface rounded-xl overflow-hidden border border-outline-variant flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      <button onClick={onViewProfile} className="relative h-56 w-full text-left cursor-pointer">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant flex items-center gap-1">
          {verified && <Icon name="verified" size={16} className="text-verified-green" />}
          <span className="font-label-sm text-label-sm text-primary">{matchScore}% Match</span>
        </div>
        {onToggleSave && (
          <span
            role="button"
            aria-label={isSaved ? "Remove from interested" : "Mark as interested"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-surface/90 backdrop-blur-sm border border-outline-variant flex items-center justify-center text-on-surface hover:text-secondary transition-colors"
          >
            <Icon name="bookmark" filled={isSaved} className={isSaved ? "text-secondary" : ""} size={18} />
          </span>
        )}
      </button>

      <div className="p-5 flex flex-col flex-grow">
        <h2 onClick={onViewProfile} className="font-headline-sm text-headline-sm text-on-surface mb-2 cursor-pointer hover:text-primary transition-colors w-fit">
          {name}, {age}
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-4">{bio}</p>

        {traits.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 mt-auto">
            {traits.map((trait) => (
              <span key={trait} className="px-2 py-1 bg-surface-container-low text-on-surface-variant rounded font-label-sm text-label-sm">
                {trait}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={onStartChat}
          className="w-full h-12 bg-secondary text-on-secondary rounded-lg font-label-lg text-label-lg hover:bg-sunset-orange transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Icon name="chat" />
          Start Chat
        </button>
      </div>
    </article>
  );
}

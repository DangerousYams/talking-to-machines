interface Props {
  name: string;
  description: string;
  accent: string;
  index?: number;
}

export default function ConceptCard({ name, description, accent, index = 0 }: Props) {
  return (
    <div
      className="group relative rounded-xl border border-gray-200/60 bg-white/80 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: accent }}
      />
      <h3
        className="font-heading text-base font-bold mb-2"
        style={{ color: accent, fontFamily: 'var(--font-heading)' }}
      >
        {name}
      </h3>
      <p className="text-base leading-relaxed text-deep/80" style={{ fontFamily: 'var(--font-body)' }}>
        {description}
      </p>
    </div>
  );
}

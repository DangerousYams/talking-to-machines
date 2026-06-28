import type { ConceptSlideData } from '../../data/ladder';

interface Props {
  slide: ConceptSlideData;
  onComplete: () => void;
}

/** One full-screen concept card: deck typography, zero scroll-story. */
export default function ConceptSlide({ slide, onComplete }: Props) {
  return (
    <div className="ld-card">
      <p className="ld-eyebrow">{slide.eyebrow}</p>
      <h1 className="ld-title">
        {slide.title.map((seg, i) => (
          <span key={i} style={seg.c ? { color: seg.c } : undefined}>{seg.t}</span>
        ))}
      </h1>
      {slide.sub && <p className="ld-sub">{slide.sub}</p>}

      {slide.cards && (
        <div className="ld-concept-grid">
          {slide.cards.map((card) => (
            <div
              key={card.title}
              className="ld-concept-card"
              style={card.color ? ({ '--card-accent': card.color } as React.CSSProperties) : undefined}
            >
              <span className="lbl">{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
          ))}
        </div>
      )}

      {slide.footnote && <p className="ld-footnote">{slide.footnote}</p>}

      <div className="ld-actions">
        <button className="ld-btn" onClick={onComplete}>Got it →</button>
      </div>
    </div>
  );
}

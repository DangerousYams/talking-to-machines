import BeatHeader from './BeatHeader';
import BeatCompletionCard from './BeatCompletionCard';
import type { ReactNode } from 'react';

interface Props {
  beatId: string;
  beatNumber: number;
  totalBeats: number;
  title: string;
  tldr: string;
  estimatedMinutes: number;
  accentColor: string;
  nextBeatTitle?: string;
  children: ReactNode;
  /** Whether this is the first beat (skip header in read mode for cleaner hero) */
  isFirst?: boolean;
}

export default function BeatSection({
  beatId,
  beatNumber,
  totalBeats,
  title,
  tldr,
  estimatedMinutes,
  accentColor,
  nextBeatTitle,
  children,
  isFirst = false,
}: Props) {
  return (
    <div id={`beat-${beatId}`} data-beat-id={beatId}>
      {/* Beat header — always shown unless it's the first beat */}
      {!isFirst && (
        <BeatHeader
          beatNumber={beatNumber}
          totalBeats={totalBeats}
          title={title}
          estimatedMinutes={estimatedMinutes}
          accentColor={accentColor}
        />
      )}

      {children}

      {/* Beat completion marker */}
      <BeatCompletionCard
        beatId={beatId}
        beatTitle={title}
        nextBeatTitle={nextBeatTitle}
        accentColor={accentColor}
      />
    </div>
  );
}

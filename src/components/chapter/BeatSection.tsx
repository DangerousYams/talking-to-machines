import { useChapterMode } from './ChapterModeContext';
import BeatHeader from './BeatHeader';
import SpeedRunCard from './SpeedRunCard';
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
  const { mode } = useChapterMode();
  const isSpeedRun = mode === 'speed-run';

  return (
    <div id={`beat-${beatId}`} data-beat-id={beatId} data-chapter-mode={isSpeedRun ? 'speed-run' : 'read'}>
      {/* Beat header — always shown unless it's the first beat in read mode */}
      {!(isFirst && !isSpeedRun) && (
        <BeatHeader
          beatNumber={beatNumber}
          totalBeats={totalBeats}
          title={title}
          estimatedMinutes={estimatedMinutes}
          accentColor={accentColor}
        />
      )}

      {/* Speed run: TLDR card above content */}
      {isSpeedRun && (
        <SpeedRunCard
          beatNumber={beatNumber}
          title={title}
          tldr={tldr}
          accentColor={accentColor}
        />
      )}

      {/*
        Children always render. In speed-run mode, CSS hides narrative sections
        (max-w-[680px]) while keeping widget sections (max-w-[900px]) visible.
        See global.css [data-chapter-mode="speed-run"] rules.
      */}
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

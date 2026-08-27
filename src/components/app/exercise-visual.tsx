"use client";

import { useEffect, useState } from "react";
import { exerciseGifSrc, exerciseGuideFrameSrcs, exerciseImageSrc } from "@/lib/data/exercise-catalog";
import type { Exercise } from "@/types/training";

export function ExerciseVisual({ exercise, playing, alt, className, onError }: {
  exercise: Exercise;
  playing: boolean;
  alt: string;
  className?: string;
  onError?: () => void;
}) {
  const frames = exerciseGuideFrameSrcs(exercise);
  const [frameIndex, setFrameIndex] = useState(0);
  const [gifFailed, setGifFailed] = useState(false);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const timer = window.setInterval(() => setFrameIndex((index) => (index + 1) % frames.length), 650);
    return () => window.clearInterval(timer);
  }, [frames.length, playing]);

  const gif = exerciseGifSrc(exercise);
  const image = exerciseImageSrc(exercise);
  const src = frames.length
    ? frames[playing ? frameIndex : 0]
    : playing && !gifFailed ? gif ?? image : image ?? gif;

  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} draggable={false} style={frames.length ? { filter: "brightness(0)" } : undefined} onError={() => {
    if (!frames.length && playing && gif && !gifFailed && image) setGifFailed(true);
    else onError?.();
  }} className={className} />;
}

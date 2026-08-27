import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExerciseVisual } from "./exercise-visual";
import type { Exercise } from "@/types/training";

const guideExercise: Exercise = {
  id: "wg-hip-abduction-machine",
  name: "hip abduction machine",
  muscleGroup: "gluteos",
  tags: [],
  favorite: false,
  custom: false,
  createdAt: "2026-08-27T00:00:00.000Z",
  guideSlug: "hip-abduction-machine",
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ExerciseVisual", () => {
  it("hace visibles los SVG blancos y avanza sus cuadros", () => {
    vi.useFakeTimers();
    render(<ExerciseVisual exercise={guideExercise} playing alt={guideExercise.name} />);

    const image = screen.getByAltText(guideExercise.name) as HTMLImageElement;
    const firstFrame = image.src;
    expect(image.style.filter).toBe("brightness(0)");

    act(() => vi.advanceTimersByTime(650));
    expect(image.src).not.toBe(firstFrame);
  });
});

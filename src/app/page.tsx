"use client";

export default function Home() {
  if (typeof window !== "undefined") {
    window.location.replace("/app");
  }

  return null;
}

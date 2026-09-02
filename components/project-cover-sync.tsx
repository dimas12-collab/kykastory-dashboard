"use client";
import { useEffect } from "react";

export function ProjectCoverSync() {
  useEffect(() => { fetch("/api/projects").then(response => response.json()).then(result => { const cover = document.querySelector<HTMLElement>("main div[style*='background-image']"); if (cover && result.data?.[0]?.coverImageUrl) cover.style.backgroundImage = `url(${result.data[0].coverImageUrl})`; }); }, []);
  return null;
}

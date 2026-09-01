"use client";
import { useEffect } from "react";

export function ProjectCoverSync() {
  useEffect(() => { fetch("/api/projects/demo-project").then(response => response.json()).then(result => { const cover = document.querySelector<HTMLElement>("main div[style*='background-image']"); if (cover && result.data?.coverImageUrl) cover.style.backgroundImage = `url(${result.data.coverImageUrl})`; }); }, []);
  return null;
}

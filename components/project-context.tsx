"use client";
import { createContext, useContext } from "react";
export type ActiveProject = { id: string; name: string; coupleName: string; eventDate: string; invitationUrl: string; coverImageUrl?: string | null; status: string; wordpressPostId?: number | null; wordpressUrl?: string | null; weddingpressSyncUrl?: string | null };
export const ProjectContext = createContext<ActiveProject | null>(null);
export function useActiveProject() { return useContext(ProjectContext); }

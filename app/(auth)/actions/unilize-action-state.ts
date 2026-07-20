import type { UnilizeClient, UnilizeProject } from "@/types/unilize";

export type CreateClientActionState = {
  success: boolean;
  error?: string;
  client?: UnilizeClient;
};

export const initialCreateClientState: CreateClientActionState = {
  success: false,
};

export type DeleteClientActionState = {
  success: boolean;
  error?: string;
  deletedClientId?: string;
};

export const initialDeleteClientState: DeleteClientActionState = {
  success: false,
};

export type GetClientActionResult = {
  requestUrl: string;
  client: UnilizeClient | null;
  error: string | null;
};

export type ListProjectsActionResult = {
  requestUrl: string;
  projects: UnilizeProject[];
  error: string | null;
};

export type GetProjectResult = {
  requestUrl: string;
  projectId: string;
  project: UnilizeProject | null;
  error: string | null;
};

export type CreateProjectActionState = {
  success: boolean;
  error?: string;
  project?: UnilizeProject;
  clientId?: string;
};

export const initialCreateProjectState: CreateProjectActionState = {
  success: false,
};

export type DeleteProjectActionState = {
  success: boolean;
  error?: string;
  deletedProjectId?: string;
  clientId?: string;
};

export const initialDeleteProjectState: DeleteProjectActionState = {
  success: false,
};

export type UpdateProjectKeywordsActionState = {
  success: boolean;
  error?: string;
  project?: UnilizeProject;
  projectId?: string;
  keywords?: string[];
};

export const initialUpdateProjectKeywordsState: UpdateProjectKeywordsActionState =
  {
    success: false,
  };

// src/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
const FUNC_CODE = import.meta.env.VITE_FUNC_CODE as string;

if (!API_BASE_URL) {
  console.warn("VITE_API_BASE_URL is not set");
}
if (!FUNC_CODE) {
  console.warn("VITE_FUNC_CODE is not set");
}

async function apiGet<T>(path: string, query?: Record<string, string | undefined>): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }
  }

  url.searchParams.set("code", FUNC_CODE);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`GET ${url.pathname} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function apiPut<TResponse, TBody extends object = Record<string, unknown>>(
  path: string,
  body: TBody
): Promise<TResponse> {
  const url = new URL(`${API_BASE_URL}${path}`);
  url.searchParams.set("code", FUNC_CODE);

  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT ${url.pathname} failed: ${res.status} ${res.statusText} – ${text}`);
  }

  return res.json();
}


// ---- Types that match your API ----

export interface CodeTypeMapping {
  CodeTypeMappingID: number;
  AgencyName: string;
  AgencyAbbreviation: string;
  HA_Code_List: string;
  Reg_App_Code_List: string;
  MappingConfidenceScore?: number | null;
  MappingSource?: string | null;
  CurrentStatus?: string | null;
  ReviewerComments?: string | null;
}

export interface TermMapping {
  TermMappingID: number;
  AgencyName: string;
  AgencyAbbreviation: string;
  CodeSystemName: string;
  HA_Term: string;
  Reg_App_Term: string;
  VaultUUID: string;
  VeevaCodeListName: string;
  MappingConfidenceScore?: number | null;
  MappingSource?: string | null;
  CurrentStatus?: string | null;
  ReviewerComments?: string | null;
  ReviewedBy?: string | null;
  ReviewDate?: string | null;
  IsActive: boolean;
}

// ---- API functions ----

export function fetchCodeTypeMappings(): Promise<CodeTypeMapping[]> {
  return apiGet<CodeTypeMapping[]>("/code-type-mappings");
}

// For now we filter by agencyName only (you can extend later)
export function fetchTermMappings(agencyName: string): Promise<TermMapping[]> {
  return apiGet<TermMapping[]>("/term-mappings", { agencyName });
}

export interface UpdateTermMappingPayload {
  currentStatus?: string;
  reviewerComments?: string;
  reviewedBy?: string;
}

export function updateTermMapping(
  termMappingId: number,
  payload: UpdateTermMappingPayload
): Promise<{ message: string }> {
  return apiPut<{ message: string }, UpdateTermMappingPayload>(
    `/term-mappings/${termMappingId}`,
    payload
  );
}


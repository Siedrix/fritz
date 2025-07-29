const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

export interface CounterData {
  count: number;
  lastClick: string;
}

export interface CounterWithUuid extends CounterData {
  uuid: string;
}

export async function getAllCounters(): Promise<CounterWithUuid[]> {
  const response = await fetch(`${API_BASE_URL}/api/counters`);
  if (!response.ok) {
    throw new Error('Failed to fetch counters');
  }
  return response.json();
}

export async function getCounter(uuid: string): Promise<CounterData> {
  const response = await fetch(`${API_BASE_URL}/api/counter/${uuid}`);
  if (!response.ok) {
    throw new Error('Failed to fetch counter');
  }
  return response.json();
}

export async function incrementCounter(uuid: string): Promise<CounterData> {
  const response = await fetch(`${API_BASE_URL}/api/counter/${uuid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error('Failed to increment counter');
  }
  return response.json();
}

export async function deleteCounter(uuid: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/counter/${uuid}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error('Failed to delete counter');
  }
  return response.json();
}

export async function createCounter(): Promise<string> {
  const newUuid = crypto.randomUUID();
  // Initialize the counter by fetching it (server creates it if it doesn't exist)
  await getCounter(newUuid);
  return newUuid;
}
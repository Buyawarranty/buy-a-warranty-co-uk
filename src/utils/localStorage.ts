// Optimized localStorage utilities with batching and error handling

export const batchLocalStorageWrite = (updates: Record<string, string>) => {
  try {
    Object.entries(updates).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export const safeLocalStorageRead = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return null;
  }
};

export const safeLocalStorageRemove = (keys: string[]) => {
  try {
    keys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

export const parseLocalStorageJSON = <T>(key: string): T | null => {
  try {
    const value = safeLocalStorageRead(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error parsing JSON from localStorage key ${key}:`, error);
    return null;
  }
};
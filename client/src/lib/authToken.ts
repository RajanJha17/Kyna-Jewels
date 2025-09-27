let accessTokenMemory: string | null = null;

export function setAccessToken(token: string | null) {
  accessTokenMemory = token;
  try {
    if (token) {
      sessionStorage.setItem("accessToken", token);
    } else {
      sessionStorage.removeItem("accessToken");
    }
  } catch {
    // ignore storage errors
  }
}

export function getAccessToken(): string | null {
  if (accessTokenMemory) return accessTokenMemory;
  try {
    const fromStorage = sessionStorage.getItem("accessToken");
    if (fromStorage) {
      accessTokenMemory = fromStorage;
      return fromStorage;
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

export function clearAccessToken() {
  accessTokenMemory = null;
  try {
    sessionStorage.removeItem("accessToken");
  } catch {
    // ignore storage errors
  }
}

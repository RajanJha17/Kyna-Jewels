let accessTokenMemory: string | null = null;

export function setAccessToken(token: string | null) {
  accessTokenMemory = token;
  try {
    if (token) {
      // Store as both 'token' and 'accessToken' for compatibility
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("accessToken", token);
      localStorage.setItem("token", token);
    } else {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("accessToken");
      localStorage.removeItem("token");
    }
  } catch {
    // ignore storage errors
  }
}

export function getAccessToken(): string | null {
  console.log("🔍 getAccessToken called");
  
  if (accessTokenMemory) {
    console.log("✅ Found token in memory:", accessTokenMemory.substring(0, 20) + "...");
    return accessTokenMemory;
  }
  
  try {
    // Try multiple locations
    const fromSessionStorage = sessionStorage.getItem("token") || sessionStorage.getItem("accessToken");
    const fromLocalStorage = localStorage.getItem("token");
    
    console.log("📦 SessionStorage.token:", fromSessionStorage ? "EXISTS" : "NULL");
    console.log("📦 LocalStorage.token:", fromLocalStorage ? "EXISTS" : "NULL");
    
    // Also try to get from cookies
    let fromCookies = null;
    const cookieMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    if (cookieMatch) {
      fromCookies = decodeURIComponent(cookieMatch[1]);
      console.log("🍪 Cookie token:", fromCookies ? fromCookies.substring(0, 20) + "..." : "NULL");
    }
    
    const token = fromSessionStorage || fromLocalStorage || fromCookies;
    
    if (token) {
      console.log("✅ Token retrieved:", token.substring(0, 20) + "...");
      accessTokenMemory = token;
      // If we got it from cookies, also store it in sessionStorage for next time
      if (fromCookies && !fromSessionStorage) {
        console.log("💾 Saving cookie token to sessionStorage");
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("accessToken", token);
      }
      return token;
    } else {
      console.error("❌ NO TOKEN FOUND IN ANY STORAGE!");
    }
  } catch (e) {
    console.error("❌ Error getting token:", e);
  }
  return null;
}

export function clearAccessToken() {
  accessTokenMemory = null;
  try {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("token");
  } catch {
    // ignore storage errors
  }
}

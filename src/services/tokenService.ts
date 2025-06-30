export interface TokenData {
  token: string;
  expiresAt: number;
  tokenType: string;
}

class TokenService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly TOKEN_DATA_KEY = 'tokenData';
  private logoutCallback?: () => void;

  setLogoutCallback(callback: () => void) {
    this.logoutCallback = callback;
  }

  saveToken(token: string, expiresIn: number, tokenType: string = 'Bearer') {
    const expiresAt = Date.now() + expiresIn;
    const tokenData: TokenData = {
      token,
      expiresAt,
      tokenType,
    };

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.TOKEN_DATA_KEY, JSON.stringify(tokenData));

    // Set up automatic logout when token expires
    this.scheduleTokenExpiration(expiresIn);
  }

  getToken(): string | null {
    const tokenData = this.getTokenData();
    if (!tokenData) return null;

    // Check if token is expired
    if (Date.now() >= tokenData.expiresAt) {
      this.removeToken();
      if (this.logoutCallback) {
        this.logoutCallback();
      }
      return null;
    }

    return tokenData.token;
  }

  getTokenData(): TokenData | null {
    const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);
    if (!tokenDataStr) return null;

    try {
      return JSON.parse(tokenDataStr);
    } catch {
      return null;
    }
  }

  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_DATA_KEY);
  }

  isTokenValid(): boolean {
    const tokenData = this.getTokenData();
    if (!tokenData) return false;
    return Date.now() < tokenData.expiresAt;
  }

  getAuthHeader(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const tokenData = this.getTokenData();
    const tokenType = tokenData?.tokenType || 'Bearer';
    return `${tokenType} ${token}`;
  }

  private scheduleTokenExpiration(expiresIn: number) {
    // Clear any existing timeout
    if ((window as any).tokenExpirationTimeout) {
      clearTimeout((window as any).tokenExpirationTimeout);
    }

    // Schedule logout 1 minute before token expires or when it expires
    const logoutDelay = Math.max(expiresIn - 60000, 0); // 1 minute before expiry
    
    (window as any).tokenExpirationTimeout = setTimeout(() => {
      if (this.logoutCallback) {
        this.logoutCallback();
      }
    }, logoutDelay);
  }

  // Check token expiration on app load
  checkTokenOnLoad() {
    const tokenData = this.getTokenData();
    if (!tokenData) return;

    const timeUntilExpiry = tokenData.expiresAt - Date.now();
    
    if (timeUntilExpiry <= 0) {
      // Token already expired
      this.removeToken();
      if (this.logoutCallback) {
        this.logoutCallback();
      }
    } else {
      // Schedule expiration
      this.scheduleTokenExpiration(timeUntilExpiry);
    }
  }
}

export const tokenService = new TokenService();

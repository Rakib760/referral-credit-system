// Simple in-memory token store for development
// In production, use Redis or database

interface TokenData {
  email: string;
  expiresAt: number;
  createdAt: number;
}

class TokenStore {
  private tokens = new Map<string, TokenData>();
  
  // Store a token with 1-hour expiry
  store(email: string, token: string): void {
    const expiresAt = Date.now() + 3600000; // 1 hour
    this.tokens.set(token, {
      email,
      expiresAt,
      createdAt: Date.now()
    });
    
    console.log(`✅ Token stored for: ${email} (expires: ${new Date(expiresAt).toLocaleTimeString()})`);
  }
  
  // Get token data
  get(token: string): TokenData | null {
    const data = this.tokens.get(token);
    if (!data) return null;
    
    // Check if expired
    if (data.expiresAt < Date.now()) {
      this.tokens.delete(token);
      return null;
    }
    
    return data;
  }
  
  // Delete token
  delete(token: string): void {
    this.tokens.delete(token);
    console.log(`🗑️ Token deleted: ${token}`);
  }
  
  // Verify token
  verify(token: string): { valid: boolean; email?: string; error?: string } {
    const data = this.get(token);
    
    if (!data) {
      return { valid: false, error: 'Invalid or expired token' };
    }
    
    return { valid: true, email: data.email };
  }
}

// Export a singleton instance
export const tokenStore = new TokenStore();
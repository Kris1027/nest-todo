declare namespace Express {
  interface Request {
    user?: {
      sub: number;
      email: string;
      tokenId?: number;
    };
    refreshToken?: string;
    tokenId?: number;
  }
}

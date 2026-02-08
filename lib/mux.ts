import Mux from '@mux/mux-node';

// Initialize Mux client with API credentials
const tokenId = process.env.MUX_TOKEN_ID;
const tokenSecret = process.env.MUX_TOKEN_SECRET;

if (!tokenId || !tokenSecret) {
  console.error('Mux credentials missing:', {
    hasTokenId: !!tokenId,
    hasTokenSecret: !!tokenSecret,
  });
}

export const mux = new Mux({
  tokenId: tokenId!,
  tokenSecret: tokenSecret!,
});

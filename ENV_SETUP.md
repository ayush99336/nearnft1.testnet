# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Copy from the example
cp .env.example .env
```

Then edit `.env` with your actual values:

```bash
# Pinata JWT Token - Get this from pinata.cloud
VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_jwt_token_here

# Pinata Gateway - Use the default or your custom subdomain
VITE_PINATA_GATEWAY=gateway.pinata.cloud
```

## Getting Pinata Credentials

### Step 1: Sign up for Pinata
1. Go to [pinata.cloud](https://pinata.cloud)
2. Create a free account
3. Verify your email

### Step 2: Create API Key
1. Go to API Keys in your dashboard
2. Click "New Key"
3. Give it a name like "NFT DApp"
4. Enable permissions:
   - ✅ `pinFileToIPFS`
   - ✅ `pinJSONToIPFS` 
   - ✅ `userPinnedDataTotal`
5. Click "Create Key"
6. Copy the JWT token (starts with `eyJ...`)

### Step 3: Gateway Setup
- For the free tier, use: `gateway.pinata.cloud`
- For custom gateways (paid plans), use your subdomain: `your-subdomain.mypinata.cloud`

## Environment Variable Format

### ✅ Correct Format:
```bash
VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEYxN...
VITE_PINATA_GATEWAY=gateway.pinata.cloud
```

### ❌ Wrong Format:
```bash
VITE_PINATA_JWT="eyJhbGci..."  # Don't use quotes
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud  # Don't include https://
VITE_PINATA_GATEWAY=your-gateway-subdomain.mypinata.cloud  # Update to your actual subdomain
```

## Testing Your Setup

After setting up your `.env` file:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Check the browser console - you should see:
   - No "undefined" in the IPFS URLs
   - Successful Pinata uploads
   - Working gateway URLs

## Troubleshooting

### "IPFS URL shows undefined"
- Check that `VITE_PINATA_GATEWAY` is set correctly
- Make sure there are no quotes around the value
- Restart the dev server after changing .env

### "Upload failed" or "401 Unauthorized"
- Verify your `VITE_PINATA_JWT` is correct
- Make sure the JWT token has the right permissions
- Check your Pinata account quota

### "CORS errors"
- The app now uses multiple RPC endpoints to handle CORS
- If all endpoints fail, try using NEAR CLI instead

## NEAR CLI Alternative

If the web interface has persistent issues, you can use NEAR CLI:

```bash
# Install NEAR CLI
npm install -g near-cli

# Login
near login

# Initialize contract
near call nearnft1.testnet new_default_meta '{"owner_id": "your-account.testnet"}' --accountId your-account.testnet

# Mint an NFT (after uploading to IPFS manually)
near call nearnft1.testnet nft_mint '{"token_id": "token-1", "receiver_id": "your-account.testnet", "token_metadata": {"title": "My NFT", "description": "Description", "media": "https://gateway.pinata.cloud/ipfs/YOUR_CID"}}' --accountId your-account.testnet --deposit 0.01
```

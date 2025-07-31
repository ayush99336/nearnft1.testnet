# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# NEAR NFT Minting DApp

A decentralized NFT minting application built on the NEAR blockchain with IPFS storage via Pinata.

## Features

- 🌐 **NEAR Blockchain Integration**: Mint NFTs on NEAR testnet
- 📁 **IPFS Storage**: Store NFT metadata and images on IPFS via Pinata
- 🔗 **Wallet Integration**: Connect with NEAR wallets (MyNearWallet, Meteor)
- 🖼️ **Image Preview**: Preview your NFT before minting
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎨 **NFT Gallery**: View your minted NFTs

## Prerequisites

- Node.js (v16 or higher)
- A NEAR testnet account
- Pinata account for IPFS storage

## Setup

### 1. Clone and Install Dependencies

```bash
cd greet-ui
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your Pinata credentials:

```
VITE_PINATA_JWT=your_pinata_jwt_token_here
VITE_PINATA_GATEWAY=your-gateway-subdomain.mypinata.cloud
```

### 3. Get Pinata Credentials

1. Sign up at [pinata.cloud](https://pinata.cloud)
2. Go to the API Keys section
3. Create a new API key with permissions for:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `userPinnedDataTotal`
4. Copy your JWT token to the `.env` file
5. Set up a gateway subdomain in Pinata and add it to `.env`

### 4. NEAR Contract Setup

The app is configured to work with the contract deployed at `ignitusnear.testnet`. 

If you want to deploy your own contract:

1. Deploy a NEAR NFT contract following the [NEAR NFT standard](https://nomicon.io/Standards/Tokens/NonFungibleToken/)
2. Update the `CONTRACT_ID` in `src/App.tsx`
3. Ensure your contract implements these methods:
   - `nft_mint(token_id, receiver_id, token_metadata)`
   - `nft_tokens_for_owner(account_id)`

## Contract ABI Compliance

The app is built to work with the provided NEAR NFT contract ABI that includes:

- `nft_mint`: Mint new NFTs with token metadata
- `nft_tokens_for_owner`: Get NFTs owned by an account
- `nft_metadata`: Get contract metadata
- Standard NFT transfer and approval functions

## Usage

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Connect Your Wallet

- Click "Connect NEAR Wallet"
- Choose your preferred wallet (MyNearWallet or Meteor)
- Approve the connection

### 3. Initialize the Contract (Important!)

**⚠️ The contract must be initialized before you can mint NFTs.**

If you see a yellow banner saying "Contract Not Initialized":

1. **Via the DApp** (Recommended):
   - Connect your NEAR wallet
   - Click the "Initialize Contract" button
   - Approve the transaction

2. **Via NEAR CLI** (Alternative):
   ```bash
   # Install NEAR CLI
   npm install -g near-cli
   
   # Login to your account
   near login
   
   # Initialize the contract
   near call ignitusnear.testnet new_default_meta '{"owner_id": "YOUR_ACCOUNT.testnet"}' --accountId YOUR_ACCOUNT.testnet
   ```

### 4. Mint an NFT

### 4. Mint an NFT

1. **Add NFT Details**:
   - Enter a title for your NFT (required)
   - Add a description (optional)
   
2. **Upload Image**:
   - Click "Select Image" and choose your image file
   - Preview will appear on the right

3. **Mint**:
   - Click "Mint NFT"
   - Approve the transaction in your wallet
   - Wait for confirmation

### 5. View Your Collection

Your minted NFTs will appear in the "Your NFT Collection" section below the minting form.

## Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **NEAR API JS** for blockchain interaction

### NEAR Integration
- **Wallet Selector**: Multi-wallet support
- **RPC Calls**: Direct contract queries
- **Transaction Signing**: Secure minting process

### IPFS Integration
- **Pinata SDK v2**: File upload to IPFS
- **Gateway Access**: Retrieve images via Pinata gateway
- **Metadata Storage**: NFT images stored permanently on IPFS

## Project Structure

```
src/
├── App.tsx              # Main application component
├── main.tsx            # Application entry point with wallet setup
├── wallet-selector.ts  # Wallet configuration
├── App.css            # Application styles
└── index.css          # Global styles
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_PINATA_JWT` | Pinata API JWT token | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_PINATA_GATEWAY` | Pinata gateway subdomain | `gateway.pinata.cloud` |

## Gas and Storage Costs

- **Minting Cost**: ~0.01 NEAR for storage
- **Gas Fee**: Covered by the attached gas amount
- **IPFS Storage**: Free tier available on Pinata

## Troubleshooting

### Common Issues

1. **"Connect wallet & select an image first"**
   - Ensure you're connected to a NEAR wallet
   - Select an image file before minting

2. **"Please enter a title for your NFT"**
   - NFT title is required for minting

3. **Pinata Upload Fails**
   - Check your VITE_PINATA_JWT is correct
   - Verify your Pinata account has sufficient quota
   - Ensure the gateway URL is correct

4. **Transaction Fails**
   - Check you have sufficient NEAR balance (>0.01 NEAR)
   - Verify the contract is deployed and accessible
   - Try a different token ID if there's a conflict

### Development Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file is in the root directory
   - Restart the development server after adding variables

2. **Wallet Connection Issues**
   - Clear browser cache and localStorage
   - Try a different wallet provider
   - Check network connectivity

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

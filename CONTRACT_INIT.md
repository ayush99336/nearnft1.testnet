# Contract Initialization Guide

## Option 1: Initialize via the DApp (Recommended)

1. Connect your NEAR wallet to the dApp
2. If you see a yellow banner saying "Contract Not Initialized", click the "Initialize Contract" button
3. Approve the transaction in your wallet
4. The contract will be initialized with default metadata

## Option 2: Initialize via NEAR CLI

If you prefer to use the command line:

```bash
# Install NEAR CLI if you haven't already
npm install -g near-cli

# Login to your NEAR account
near login

# Initialize the contract with default metadata
near call ignitusnear.testnet new_default_meta '{"owner_id": "YOUR_ACCOUNT.testnet"}' --accountId YOUR_ACCOUNT.testnet

# Or initialize with custom metadata
near call ignitusnear.testnet new '{"owner_id": "YOUR_ACCOUNT.testnet", "metadata": {"spec": "nft-1.0.0", "name": "My NFT Collection", "symbol": "MYNFT"}}' --accountId YOUR_ACCOUNT.testnet
```

## Option 3: Check Contract Status

To check if the contract is already initialized:

```bash
# Check contract metadata (this will fail if not initialized)
near view ignitusnear.testnet nft_metadata

# Check total supply (this will also fail if not initialized)
near view ignitusnear.testnet nft_total_supply
```

## Important Notes

- Only the contract owner can initialize the contract
- The contract can only be initialized once
- The owner_id parameter should be the account that will own the contract
- After initialization, you can start minting NFTs

## Default Metadata

When using `new_default_meta`, the contract is initialized with:
- Name: "My Awesome NFT Contract"
- Symbol: "ANFT"
- Spec: "nft-1.0.0"

You can change this by modifying the smart contract code and redeploying.

import React, { useEffect, useState } from "react";
import "./App.css";
import { providers } from "near-api-js";
import { PinataSDK } from "pinata";

declare global {
  interface Window {
    selector: any;
    modal: any;
  }
}

const CONTRACT_ID = "nearnft1.testnet"; // Replace with your contract ID
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT!;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY!;

// Debug environment variables
console.log("Environment variables:", {
  PINATA_JWT: PINATA_JWT ? "Set" : "Missing",
  PINATA_GATEWAY: PINATA_GATEWAY || "Missing",
  ENV_KEYS: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
});

// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATA_GATEWAY,
});

// Alternative RPC endpoints to handle rate limiting and CORS
const RPC_ENDPOINTS = [
  "https://rpc.testnet.near.org",
  "https://near-testnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  "https://testnet.rpc.fastnear.com",
];

// Function to get a working RPC provider
const getWorkingProvider = async () => {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const provider = new providers.JsonRpcProvider({ url: endpoint });
      // Test the connection with a simple query
      await provider.status();
      console.log(`Using RPC endpoint: ${endpoint}`);
      return provider;
    } catch (err) {
      console.warn(`RPC endpoint ${endpoint} failed:`, err);
      continue;
    }
  }
  throw new Error("All RPC endpoints failed");
};

interface Token {
  token_id: string;
  owner_id: string;
  metadata?: {
    title?: string;
    description?: string;
    media?: string;
    copies?: number;
    extra?: string;
    reference?: string;
    issued_at?: string;
    expires_at?: string;
    starts_at?: string;
    updated_at?: string;
  };
}

function App() {
  const [accountId, setAccountId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [nftTitle, setNftTitle] = useState<string>("");
  const [nftDescription, setNftDescription] = useState<string>("");
  const [contractInitialized, setContractInitialized] = useState<boolean | null>(null);

  const checkContractInitialization = async () => {
    try {
      const provider = await getWorkingProvider();
      const rawResult = await provider.query({
        request_type: "call_function",
        account_id: CONTRACT_ID,
        method_name: "nft_metadata",
        args_base64: btoa(JSON.stringify({})),
        finality: "optimistic",
      });
      
      if ('result' in rawResult) {
        setContractInitialized(true);
        return true;
      }
    } catch (err: any) {
      if (err.message && err.message.includes("The contract is not initialized")) {
        setContractInitialized(false);
        return false;
      }
      console.error("Error checking contract initialization:", err);
      setContractInitialized(null);
      return false;
    }
  };

  const initializeContract = async () => {
    if (!accountId) {
      return alert("Please connect your wallet first");
    }

    setLoading(true);

    try {
      console.log("🚀 Initializing NFT contract...");
      
      const wallet = await window.selector.wallet();
      const accounts = await wallet.getAccounts();
      const signerId = accounts?.[0]?.accountId;

      if (!signerId || typeof signerId !== "string") {
        throw new Error("❌ signerId is missing or invalid");
      }

      const txPayload = {
        signerId,
        receiverId: CONTRACT_ID,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "new_default_meta",
              args: {
                owner_id: signerId,
              },
              gas: "300000000000000",
              deposit: "0",
            },
          },
        ],
      };

      console.log("📦 Initializing with payload:", JSON.stringify(txPayload, null, 2));

      await wallet.signAndSendTransaction(txPayload);

      console.log("✅ Contract initialized successfully!");
      
      // Check initialization status and fetch tokens
      await checkContractInitialization();
      await fetchTokens(signerId);
      
    } catch (err: any) {
      console.error("❌ Failed to initialize contract:", err);
      alert("Initialization failed: " + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  };

  const fetchTokens = async (ownerId: string) => {
    try {
      console.log("Fetching NFTs for owner:", ownerId);

      const provider = await getWorkingProvider();
      const rawResult = await provider.query({
        request_type: "call_function",
        account_id: CONTRACT_ID,
        method_name: "nft_tokens_for_owner",
        args_base64: btoa(JSON.stringify({ account_id: ownerId })),
        finality: "optimistic",
      });

      // Handle the response properly for browser environment
      if ('result' in rawResult) {
        const result = new Uint8Array(rawResult.result as any);
        const decoded = new TextDecoder().decode(result);
        const parsed = JSON.parse(decoded) as Token[];
        console.log("NFTs fetched:", parsed);
        setTokens(parsed);
      }
    } catch (err: any) {
      console.error("Error fetching NFTs:", err);
      
      // Check if contract is not initialized
      if (err.message && err.message.includes("The contract is not initialized")) {
        console.warn("Contract is not initialized. Setting empty token list.");
        setTokens([]); // Set empty array instead of erroring
      } else {
        // For other errors, still set empty array but log the error
        setTokens([]);
      }
    }
  };

  useEffect(() => {
    const initWalletSelector = async () => {
      if (!window.selector) {
        console.warn("Wallet Selector not initialized yet.");
        return;
      }

      const wallet = await window.selector.wallet();
      const accounts = await wallet.getAccounts();

      if (accounts.length > 0) {
        const accountId = accounts[0].accountId;
        setAccountId(accountId);
        console.log("Connected account:", accountId);

        // Check if contract is initialized first
        const isInitialized = await checkContractInitialization();
        if (isInitialized) {
          await fetchTokens(accountId);
        }
      } else {
        console.log("No accounts found.");
        // Still check contract initialization for UI purposes
        await checkContractInitialization();
      }
    };

    initWalletSelector();
  }, []);

  const login = () => {
    console.log("Opening wallet modal...");
    if (window.modal) window.modal.show();
  };

  const logout = async () => {
    try {
      const wallet = await window.selector.wallet();
      await wallet.signOut();
      console.log("Signed out.");
      setAccountId("");
      setTokens([]);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const mintNFT = async () => {
    if (!file || !accountId) {
      return alert("Connect wallet & select an image first");
    }
    if (!nftTitle) {
      return alert("Please enter a title for your NFT");
    }

    setLoading(true);

    try {
      console.log("🚀 Starting NFT mint process...");

      // 1) Upload file to Pinata using V2 SDK
      console.log("📤 Uploading to Pinata...");
      const upload = await pinata.upload
        .public.file(file)
        .name(nftTitle)
        .keyvalues({
          type: "nft-media",
          owner: accountId
        });      const cid = upload.cid;
      const mediaUrl = `https://${PINATA_GATEWAY}/ipfs/${cid}`;
      console.log("✅ File uploaded to IPFS:", mediaUrl);

      // 2) Mint NFT on NEAR using correct ABI structure
      console.log("🎨 Minting NFT on NEAR...");
      const wallet = await window.selector.wallet();
      const accounts = await wallet.getAccounts();
      const signerId = accounts?.[0]?.accountId;

      if (!signerId || typeof signerId !== "string") {
        throw new Error("❌ signerId is missing or invalid");
      }

      const tokenId = `nft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Following the ABI structure exactly
      const txPayload = {
        signerId,
        receiverId: CONTRACT_ID,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "nft_mint",
              args: {
                token_id: tokenId,
                receiver_id: signerId,
                token_metadata: {
                  title: nftTitle,
                  description: nftDescription,
                  media: mediaUrl,
                  copies: 1,
                },
              },
              gas: "300000000000000",
              deposit: "10000000000000000000000", // 0.01 NEAR for storage
            },
          },
        ],
      };

      console.log("📦 Minting with payload:", JSON.stringify(txPayload, null, 2));

      await wallet.signAndSendTransaction(txPayload);

      console.log("✅ NFT minted successfully!");
      
      // 3) Refresh NFT gallery
      await fetchTokens(signerId);
      
      // Reset form
      setFile(null);
      setPreview("");
      setNftTitle("");
      setNftDescription("");
      
    } catch (err: any) {
      console.error("❌ Failed to mint NFT:", err);
      alert("Mint failed: " + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-4">NEAR NFT Minting DApp</h1>

      {!accountId ? (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow"
          onClick={login}
        >
          Connect NEAR Wallet
        </button>
      ) : (
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">Connected as:</span>
                <span className="text-blue-600 font-semibold ml-2">{accountId}</span>
              </div>
              <button
                className="text-sm text-red-500 hover:underline"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Contract Initialization Status */}
          {contractInitialized === false && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-yellow-800">Contract Not Initialized</h3>
                  <p className="text-yellow-700">
                    The NFT contract needs to be initialized before you can mint NFTs.
                  </p>
                </div>
                <button
                  onClick={initializeContract}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded disabled:bg-gray-400"
                >
                  {loading ? "Initializing..." : "Initialize Contract"}
                </button>
              </div>
            </div>
          )}

          {/* Mint NFT Section - only show if contract is initialized */}
          {contractInitialized === true && (
            <div className="bg-white p-6 rounded shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Mint New NFT</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">NFT Title *</label>
                    <input
                      className="w-full px-3 py-2 border rounded"
                      type="text"
                      value={nftTitle}
                      onChange={(e) => setNftTitle(e.target.value)}
                      placeholder="Enter NFT title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                      value={nftDescription}
                      onChange={(e) => setNftDescription(e.target.value)}
                      placeholder="Enter NFT description (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Select Image *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  <button
                    onClick={mintNFT}
                    disabled={!file || !nftTitle || loading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
                  >
                    {loading ? "Minting NFT..." : "Mint NFT (0.01 NEAR)"}
                  </button>
                </div>

                {/* Right: Preview */}
                <div>
                  <label className="block text-sm font-medium mb-2">Preview</label>
                  {preview ? (
                    <div className="border rounded p-4">
                      <img
                        src={preview}
                        alt="NFT Preview"
                        className="w-full h-64 object-cover rounded mb-2"
                      />
                      <p className="font-medium">{nftTitle || "Untitled"}</p>
                      <p className="text-gray-600 text-sm">{nftDescription || "No description"}</p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center text-gray-500">
                      Select an image to see preview
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NFT Gallery */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Your NFT Collection</h2>
            {tokens.length === 0 ? (
              <p className="text-gray-500">No NFTs found. Mint your first NFT above!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tokens.map((token) => {
                  // Fix broken URLs from previous mints when PINATA_GATEWAY was undefined
                  let imageUrl = token.metadata?.media || "/placeholder.svg";
                  if (imageUrl.includes("https://undefined/ipfs/")) {
                    // Extract the IPFS hash and use current gateway
                    const ipfsHash = imageUrl.split("/ipfs/")[1];
                    imageUrl = `https://${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
                  }
                  
                  return (
                    <div key={token.token_id} className="border rounded overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={token.metadata?.title || "Untitled"}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          // Fallback for broken images
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate">
                          {token.metadata?.title || "Untitled"}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">
                          {token.metadata?.description || "No description"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          ID: {token.token_id}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// components/MintGallery.tsx
import React, { useEffect, useState } from 'react';
import { providers } from 'near-api-js';

declare global {
  interface Window {
    selector: any;
    modal: any;
  }
}

const CONTRACT_ID = 'nearnft1.testnet';  // your deployed contract

interface NearToken {
  token_id: string;
  owner_id: string;
  metadata: {
    title?: string;
    description?: string;
    media: string;
    copies?: number;
  };
}

export function MintGallery() {
  const [accountId, setAccountId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<NearToken[]>([]);

  // Initialize wallet & fetch existing NFTs
  useEffect(() => {
    async function init() {
      if (!window.selector) return;
      const wallet = await window.selector.wallet();
      const accs = await wallet.getAccounts();
      if (accs.length > 0) {
        setAccountId(accs[0].accountId);
        await fetchTokens(accs[0].accountId);
      }
    }
    init();
  }, []);

  async function fetchTokens(who: string) {
    try {
      const provider = new providers.JsonRpcProvider({
        url: 'https://rpc.testnet.near.org',
      });
      const raw = await provider.query({
        request_type: 'call_function',
        account_id: CONTRACT_ID,
        method_name: 'nft_tokens_for_owner',
        args_base64: btoa(JSON.stringify({ account_id: who })),
        finality: 'optimistic',
      }) as any;
      const result = JSON.parse(new TextDecoder().decode(raw.result)) as NearToken[];
      setTokens(result);
    } catch (e) {
      console.error('Fetch tokens failed', e);
    }
  }

  function login() {
    window.modal?.show();
  }
  async function logout() {
    const wallet = await window.selector.wallet();
    await wallet.signOut();
    setAccountId('');
    setTokens([]);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : '');
  }

  async function mint() {
    if (!file || !accountId) {
      return alert('Connect wallet & select an image first');
    }
    setLoading(true);
    try {
      // 1) upload to Pinata via our API
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });
      const body = await resp.json();
      if (!resp.ok || !body.ipfsUrl) {
        throw new Error(body.error || 'Upload failed');
      }
      const mediaUrl: string = body.ipfsUrl;

      // 2) call nft_mint
      const wallet = await window.selector.wallet();
      const signerId = (await wallet.getAccounts())[0].accountId;

      await wallet.signAndSendTransaction({
        signerId,
        receiverId: CONTRACT_ID,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'nft_mint',
              args: {
                token_id: `nft-${Date.now()}`,
                receiver_id: signerId,
                metadata: {
                  title: file.name,
                  description: '',
                  media: mediaUrl,
                  copies: 1,
                },
              },
              gas: '300000000000000',
              deposit: '100000000000000000000000', // 0.1 NEAR
            },
          },
        ],
      });

      // 3) refresh
      await fetchTokens(signerId);
      setFile(null);
      setPreview('');
    } catch (e: any) {
      console.error('Mint error', e);
      alert('Mint failed: ' + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-white rounded shadow max-w-lg mx-auto">
      {!accountId ? (
        <button
          onClick={login}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <span>Logged in as <strong>{accountId}</strong></span>
            <button
              onClick={logout}
              className="text-red-500 text-sm hover:underline"
            >
              Sign out
            </button>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Select image to mint:</label>
            <input type="file" accept="image/*" onChange={onFileChange} />
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="mt-2 w-48 h-48 object-cover rounded"
              />
            )}
            <button
              onClick={mint}
              disabled={loading || !file}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Minting…' : 'Mint NFT'}
            </button>
          </div>

          <h2 className="font-semibold mb-2">Your NFTs</h2>
          {tokens.length === 0 ? (
            <p>No NFTs yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {tokens.map((t) => (
                <div key={t.token_id} className="border p-2 rounded">
                  <img
                    src={t.metadata.media}
                    alt={t.token_id}
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="mt-1 text-center text-sm font-mono">
                    {t.token_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

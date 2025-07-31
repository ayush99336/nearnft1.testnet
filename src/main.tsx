
import { Buffer } from 'buffer';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';

// Make Buffer available globally for NEAR API
declare global {
  interface Window {
    Buffer: typeof Buffer;
    selector: any;
    modal: any;
  }
}

window.Buffer = Buffer;

const init = async () => {
  const selector = await setupWalletSelector({
    network: 'testnet',
    modules: [setupMeteorWallet(),setupMyNearWallet()],
  });

  const modal = setupModal(selector, {
    contractId: 'nearnft1.testnet',
  });

  window.selector = selector;
  window.modal = modal;

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

init();

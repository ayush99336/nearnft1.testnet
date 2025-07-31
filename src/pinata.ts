// src/pinata.ts
import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  // Use your Pinata JWT, not key+secret, for CORS in the browser:
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  // Optional: your custom gateway subdomain
  pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
});

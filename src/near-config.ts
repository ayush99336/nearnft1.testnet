export const CONTRACT_NAME = "ignitusnear.testnet"; // Replace with your contract ID

const getConfig = () => {
  return {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "testnet.mynearwallet.com",
    helperUrl: "https://helper.testnet.near.org",
    contractName: "ignitusnear.testnet",
  };
};

export default getConfig;
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { useState, useCallback, useRef } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Platform } from 'react-native';

// ── DEV_MODE: true = devnet (safe testing), false = mainnet (production) ──────
const DEV_MODE = false;
const SOLANA_RPC = DEV_MODE
  ? 'https://api.devnet.solana.com'
  : 'https://api.mainnet-beta.solana.com';
const CLUSTER = DEV_MODE ? 'devnet' : 'mainnet-beta';

const APP_IDENTITY = {
  name: 'Sol-lionaire',
  uri: 'https://sol-lionaire.app',
  icon: 'assets/icon.png',
};

const base64ToPublicKey = (base64Str) => {
  const bytes = Buffer.from(base64Str, 'base64');
  return new PublicKey(bytes);
};

export const useRealWalletConnection = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance]             = useState(0);
  const [isConnected, setIsConnected]     = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState(null);
  const [walletName, setWalletName]       = useState(null);
  const [authToken, setAuthToken]         = useState(null);

  // useRef: single Connection instance for the lifetime of the hook
  const connectionRef = useRef(new Connection(SOLANA_RPC, 'confirmed'));
  const connection = connectionRef.current;

  // Fetch balance separately — non-blocking, runs async without delaying connect
  const fetchBalance = async (pubkeyStr) => {
    try {
      const lamports = await connection.getBalance(new PublicKey(pubkeyStr));
      return lamports / LAMPORTS_PER_SOL;
    } catch (e) {
      console.error('Balance fetch failed:', e);
      return 0;
    }
  };

  const connectWallet = useCallback(async (walletId = 'phantom') => {
    setIsLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'android') {
        console.log(`📱 Connecting via MWA: ${walletId}`);

        const { publicKey, authToken: token } = await transact(async (wallet) => {
          const authResult = await wallet.authorize({
            cluster: CLUSTER,
            identity: APP_IDENTITY,
          });
          return {
            publicKey: authResult.accounts[0].address,
            authToken: authResult.auth_token,
          };
        });

        const pubkey = base64ToPublicKey(publicKey);
        const pubkeyStr = pubkey.toBase58();
        console.log('✅ Connected (base58):', pubkeyStr);

        // ★ Key: update connection state immediately without waiting for balance!
        setWalletAddress(pubkeyStr);
        setIsConnected(true);
        setWalletName(walletId === 'phantom' ? '👻 Phantom' : 'Seed Vault');
        setAuthToken(token);
        setIsLoading(false);

        // Balance fetched separately in background
        fetchBalance(pubkeyStr).then(sol => {
          console.log('💰 Balance:', sol, 'SOL');
          setBalance(sol);
        });

        return { publicKey: pubkeyStr };

      } else {
        // Web fallback
        const mockKey = '7gh5fZGdnGQWLajuGj8u4rEPNZrVjtxPbCXNHDzkQ5LX';
        setWalletAddress(mockKey);
        setBalance(2.0);
        setIsConnected(true);
        setWalletName('Test Wallet');
        return { publicKey: mockKey, balance: 2.0 };
      }

    } catch (err) {
      console.error('❌ Wallet connection failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    setWalletAddress(null);
    setBalance(0);
    setIsConnected(false);
    setWalletName(null);
    setAuthToken(null);
    setError(null);
  }, []);

  const signAndSendTransaction = useCallback(async (transaction) => {
    if (!isConnected || !walletAddress) throw new Error('Wallet not connected');
    try {
      if (Platform.OS === 'android' && authToken) {
        return await transact(async (wallet) => {
          await wallet.authorize({
            cluster: CLUSTER,
            identity: APP_IDENTITY,
            auth_token: authToken,
          });
          const { blockhash } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = new PublicKey(walletAddress);
          const [signedTx] = await wallet.signTransactions({ transactions: [transaction] });
          const sig = await connection.sendRawTransaction(signedTx.serialize());
          await Promise.race([
            connection.confirmTransaction(sig, 'processed'),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Confirmation timeout (15s)')), 15000)
            ),
          ]);
          return sig;
        });
      }
      // Non-Android or missing authToken — MWA is Android-only
      throw new Error('Transaction signing requires Android with Mobile Wallet Adapter');
    } catch (e) {
      console.error('❌ Transaction failed:', e);
      throw e;
    }
  }, [isConnected, walletAddress, authToken]);

  return {
    walletAddress, balance, isConnected, isLoading,
    error, walletName, connectWallet, disconnectWallet,
    signAndSendTransaction,
  };
};

export default useRealWalletConnection;

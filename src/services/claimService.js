/**
 * Claim Service — Sol-lionaire
 *
 * Records the user's current territory level on Solana
 * via the Memo program. Proof of status on-chain.
 */
import { Transaction, TransactionInstruction, PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

// Solana Memo Program (no setup required)
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

/**
 * Build a Memo transaction that records the user's territory on-chain.
 * Costs ~0.000005 SOL in network fees.
 */
export const buildClaimTransaction = ({ tier, city, walletAddress }) => {
  const memo = JSON.stringify({
    app: 'sol-lionaire',
    v: '1',
    level: tier.level,
    name: tier.names[city],
    city: city.toLowerCase(),
    ts: Date.now(),
  });

  return new Transaction().add(
    new TransactionInstruction({
      keys: [{ pubkey: new PublicKey(walletAddress), isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo, 'utf8'),
    })
  );
};

/**
 * Returns Solana Explorer URL for a given transaction signature.
 */
export const getExplorerUrl = (sig) =>
  `https://explorer.solana.com/tx/${sig}`;

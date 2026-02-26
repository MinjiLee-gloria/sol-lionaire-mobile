import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
import { nftMinter, createNFTMetadata } from '../services/nftMinter';

/**
 * NFT Mint Button Component
 * 영토를 cNFT로 발행하는 버튼
 */
export const MintButton = ({ 
  mappingResult, 
  walletAddress, 
  balance, 
  connection,
  onMintSuccess,
  onMintError,
}) => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNFT, setMintedNFT] = useState(null);

  const handleMint = async () => {
    if (!nftMinter.canMint(balance)) {
      Alert.alert(
        'Insufficient Balance',
        'You need at least 0.001 SOL to mint an NFT.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsMinting(true);

    try {
      // Metadata 생성
      const metadata = createNFTMetadata(mappingResult);
      
      // NFT 발행
      const result = await nftMinter.mintCompressedNFT(
        walletAddress,
        metadata,
        connection
      );

      // LocalStorage에 저장
      nftMinter.saveNFTLocally(walletAddress, result);

      setMintedNFT(result);

      Alert.alert(
        '✅ NFT Minted!',
        `Your territory is now permanently yours!\n\nNFT ID: ${result.nftId.slice(0, 16)}...`,
        [
          { text: 'View on Explorer', onPress: () => {
            if (result.explorerUrl) Linking.openURL(result.explorerUrl);
          }},
          { text: 'OK' }
        ]
      );

      if (onMintSuccess) {
        onMintSuccess(result);
      }
    } catch (error) {
      console.error('Minting failed:', error);
      
      Alert.alert(
        '❌ Minting Failed',
        error.message || 'Failed to mint NFT. Please try again.',
        [{ text: 'OK' }]
      );

      if (onMintError) {
        onMintError(error);
      }
    } finally {
      setIsMinting(false);
    }
  };

  const cost = nftMinter.calculateMintCost();

  if (mintedNFT) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>NFT Minted!</Text>
          <Text style={styles.successText}>
            Your territory is now on-chain
          </Text>
          <Text style={styles.nftId}>
            {mintedNFT.nftId.slice(0, 20)}...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.mintButton}
        onPress={handleMint}
        disabled={isMinting}
      >
        {isMinting ? (
          <ActivityIndicator color="#000" />
        ) : (
          <>
            <Text style={styles.mintIcon}>🎨</Text>
            <Text style={styles.mintButtonText}>Mint as NFT</Text>
            <Text style={styles.mintCost}>
              ~{cost.solAmount} SOL
            </Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.infoText}>
        💡 Own your territory forever on Solana blockchain
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  mintButton: {
    backgroundColor: '#9C27B0',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mintIcon: {
    fontSize: 20,
  },
  mintButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  mintCost: {
    color: '#E1BEE7',
    fontSize: 12,
  },
  infoText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  successCard: {
    backgroundColor: '#1B5E20',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  successText: {
    fontSize: 14,
    color: '#A5D6A7',
    marginTop: 5,
  },
  nftId: {
    fontSize: 11,
    color: '#81C784',
    marginTop: 10,
    fontFamily: 'monospace',
  },
});

export default MintButton;

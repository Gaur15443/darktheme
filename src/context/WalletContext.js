// WalletContext.js
import React, {createContext, useContext, useEffect, useState} from 'react';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {fetchCashbackBalance} from '../store/apps/wallet';
import authConfig from '../configs';

const WalletContext = createContext({
  totalBalance: 0,
  setTotalBalance: () => null,
  freeCallAvailable: false,
  setFreeCallAvailable: bool => null,
  fetchWalletData: () => Promise.resolve(),
  walletErrorMessage: '',
  setWalletErrorMessage: () => null,
  isVerified: false, // ✅ add
  setIsVerified: () => null,
});

export const WalletProvider = ({children}) => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [freeCallAvailable, setFreeCallAvailable] = useState(false);
  const [walletErrorMessage, setWalletErrorMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const walletBalanceFromStore = useSelector(
    state => state.walletSlice.walletBalance,
  );
  const dispatch = useDispatch();
  const userId = useSelector(state => state?.userInfo?._id);
  const isLoggedOut = useSelector(state => !state?.userInfo?._id);

  useEffect(() => {
    if (isLoggedOut) {
      setTotalBalance(0);
      setFreeCallAvailable(false);
      setIsVerified(false);
    }
  }, [isLoggedOut]);

  useEffect(() => {
    if (
      walletBalanceFromStore !== undefined &&
      walletBalanceFromStore !== totalBalance
    ) {
      setTotalBalance(walletBalanceFromStore);
    }
  }, [walletBalanceFromStore]);

  const fetchWalletData = async (id = userId) => {
    // Use passed id or fall back to userId
    if (!id) {
      return; // Exit early if no valid userId
    }

    try {
      const response = await axios.get(
        `${authConfig.walletBaseUrl}/mobileVerificationWallet/${id}`,
      );

      if (response.data && response.data.message === 'WalletAlreadyExists') {
        setTotalBalance(response.data.totalBalance || 0);
        setFreeCallAvailable(response.data.freeCallAvailable ?? false);
        setWalletErrorMessage(null);
        setIsVerified(true);
        return response.data;
      } else if (
        response.data &&
        response.data.message === 'Wallet created successfully'
      ) {
        setTotalBalance(response.data.totalBalance || 0);
        setFreeCallAvailable(response.data.freeCallAvailable ?? false);
        setWalletErrorMessage(null);
        setIsVerified(true);
        return response.data;
      } else {
        setWalletErrorMessage(null);
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response) {
        setWalletErrorMessage(error.response.data);
        return null;
      } else if (error.request) {
        setWalletErrorMessage({
          message: 'NetworkError',
          error: 'Unable to reach server. Please check your connection.',
        });
        return null;
      } else {
        setWalletErrorMessage({
          message: 'UnexpectedError',
          error: error.message,
        });
        return null;
      }
    }
  };

  // Optional: Expose a function to manually refresh cashback balance
  const refreshCashbackBalance = async () => {
    if (!userId) {
      return;
    }
    try {
      await dispatch(fetchCashbackBalance(userId)).unwrap();
      // walletBalanceFromStore will update via Redux, and useEffect will sync totalBalance
    } catch (error) {
      console.error('Error refreshing cashback balance:', error);
    }
  };

  const value = {
    totalBalance,
    setTotalBalance,
    fetchWalletData,
    refreshCashbackBalance,
    freeCallAvailable,
    setFreeCallAvailable,
    walletErrorMessage,
    setWalletErrorMessage,
    isVerified,
    setIsVerified,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);

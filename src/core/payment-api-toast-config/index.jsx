// src/components/providers/WalletToastProvider.tsx
import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getWalletToasts} from '../../store/apps/wallet';
import PropTypes from 'prop-types';

export default function WalletToastProvider({children}) {
  const dispatch = useDispatch();
  const walletToasts = useSelector(
    state => state.walletSlice.toastConfig.wallet,
  );

  useEffect(() => {
    if (!walletToasts || !Object.keys(walletToasts).length) {
      dispatch(getWalletToasts());
    }
  }, []);

  return <>{children}</>;
}

WalletToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

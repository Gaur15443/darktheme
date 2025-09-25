import {useEffect, useState} from 'react';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [netInfo, setNetInfo] = useState<NetInfoState | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setNetInfo(state);
    });

    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setNetInfo(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    netInfo,
  };
}

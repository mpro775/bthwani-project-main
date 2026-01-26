import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [netInfo, setNetInfo] = useState<NetInfoState | null>(null);

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(state => {
      setNetInfo(state);
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetInfo(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected: netInfo?.isConnected ?? true,
    isInternetReachable: netInfo?.isInternetReachable ?? true,
    type: netInfo?.type ?? 'unknown',
    details: netInfo?.details ?? null,
  };
};

export default useNetworkStatus;

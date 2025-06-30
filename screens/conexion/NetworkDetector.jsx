import { useState, useEffect } from 'react';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';

const useNetworkDetection = () => {
  const netInfo = useNetInfo(); 

  const [isConnected, setIsConnected] = useState(null);
  const [connectionType, setConnectionType] = useState(null);
  const [cellularGeneration, setCellularGeneration] = useState(null);

  console.log('--- useNetworkDetection State ---');
  console.log('isConnected (from hook):', isConnected);
  console.log('connectionType (from hook):', connectionType);
  console.log('cellularGeneration (from hook):', cellularGeneration);
  console.log('---------------------------------');


  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      console.log(`Conexion (Listener): ${state.isConnected}, Tipo: ${state.type}`);
      if (state.type === 'cellular' && state.details) {
        setCellularGeneration(state.details.cellularGeneration);
      } else {
        setCellularGeneration(null);
      }
    });

    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      console.log(`Conexion Inicial (Fetch): ${state.isConnected}, Tipo Inicial: ${state.type}`);
      if (state.type === 'cellular' && state.details) {
        setCellularGeneration(state.details.cellularGeneration);
      } else {
        setCellularGeneration(null);
      }
    });

    return () => unsubscribe();
  }, []); 

  return {
    isConnected,
    connectionType,
    cellularGeneration,
  };
};

export default useNetworkDetection;
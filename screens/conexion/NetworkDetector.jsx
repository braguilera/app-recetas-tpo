// components/utils/NetworkDetector.js
import { useState, useEffect } from 'react';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';

const useNetworkDetection = () => {
  const netInfo = useNetInfo(); // Este hook de @react-native-community/netinfo ya te da la info más actualizada.

  // Puedes confiar más directamente en 'netInfo' que en estados adicionales para este log
  // Si usas los estados internos, asegúrate de que se actualicen correctamente
  const [isConnected, setIsConnected] = useState(null);
  const [connectionType, setConnectionType] = useState(null);
  const [cellularGeneration, setCellularGeneration] = useState(null);

  // Agrega este console.log aquí para ver lo que el hook devuelve en cada render
  // Asegúrate de que un componente esté usando este hook para que se renderice
  console.log('--- useNetworkDetection State ---');
  console.log('isConnected (from hook):', isConnected);
  console.log('connectionType (from hook):', connectionType);
  console.log('cellularGeneration (from hook):', cellularGeneration);
  console.log('netInfo.type (from useNetInfo hook):', netInfo.type); // <--- Más directo para debugging
  console.log('netInfo.isConnected (from useNetInfo hook):', netInfo.isConnected); // <--- Más directo para debugging
  console.log('netInfo.details (from useNetInfo hook):', netInfo.details); // <--- Más directo para debugging
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
  }, []); // Dependencias vacías para que se ejecute una sola vez al montar

  return {
    isConnected,
    connectionType,
    cellularGeneration,
  };
};

export default useNetworkDetection;
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useNetworkDetection from './NetworkDetector';


const Splash = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scalePulseAnim = useRef(new Animated.Value(0)).current;
  const opacityPulseAnim = useRef(new Animated.Value(1)).current;

  const [animationCompleted, setAnimationCompleted] = useState(false);
  const { isConnected, connectionType, cellularGeneration } = useNetworkDetection();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scalePulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityPulseAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scalePulseAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacityPulseAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    const minSplashDisplayTime = 3000; 
    const animationTimer = setTimeout(() => {
      setAnimationCompleted(true);
    }, minSplashDisplayTime);

    return () => {
      clearTimeout(animationTimer);
      scalePulseAnim.stopAnimation();
      opacityPulseAnim.stopAnimation();
    };
  }, [fadeAnim, scalePulseAnim, opacityPulseAnim]);

  useEffect(() => {
    if (animationCompleted && isConnected !== null) {
      console.log(`[Splash - Navigation] Animación completa y conexión detectada: isConnected=${isConnected}, Type=${connectionType}, Gen=${cellularGeneration || 'N/A'}`);
      if (isConnected) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('NoConexion');
      }
    }
  }, [animationCompleted, isConnected, navigation, connectionType, cellularGeneration]);

  const pulseScale = scalePulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8]
  });

  const pulseOpacity = opacityPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.7]
  });

  return (
    <View className="bg-[#FEF3E2] justify-center items-center flex-1">
      <Animated.View
        className="absolute bg-amber-300 rounded-full"
        style={{
          width: 80,
          height: 80,
          transform: [{ scale: pulseScale }],
          opacity: pulseOpacity,
        }}
      />
      <Animated.View
        className="absolute bg-amber-200 rounded-full"
        style={{
          width: 80,
          height: 80,
          transform: [{ scale: Animated.add(pulseScale, 0.2) }],
          opacity: Animated.add(pulseOpacity, 0.1),
        }}
      />

      <Animated.View style={[{ opacity: fadeAnim }]} className="w-20 h-20 rounded-full bg-amber-500 items-center justify-center relative z-10">
        <Text className="text-white text-4xl font-bold">R</Text>
      </Animated.View>
    </View>
  );
};

export default Splash;
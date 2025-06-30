import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StatusBar, Image, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const ScanQR = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()

  const { courseId = 1 } = route.params || {}

  const [scanning, setScanning] = useState(true)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    if (scanning && !scanned) {
      const timer = setTimeout(() => {
        setScanned(true)
        setScanning(false)
        Alert.alert("Asistencia registrada", "Tu asistencia ha sido registrada correctamente", [
          { text: "OK", onPress: () => navigation.goBack() },
        ])
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [scanning, scanned])

  const handleRescan = () => {
    setScanning(true)
    setScanned(false)
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View className="flex-row items-center p-4">
        <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()} accessibilityLabel="Volver atrás">
          <AntDesign name="arrowleft" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Scanear QR</Text>
      </View>

      <View className="flex-1 justify-center items-center p-4">
        <View className="w-full aspect-square bg-gray-900 rounded-lg overflow-hidden relative">
          <Image source={{ uri: "https://picsum.photos/seed/qrcode/800/800" }} className="w-full h-full opacity-70" />

          <View className="absolute inset-0 flex items-center justify-center">
            <Image
              source={{ uri: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CourseAttendance" }}
              className="w-40 h-40"
            />
          </View>

          <View className="absolute inset-0 border-2 border-amber-400 m-16 rounded-lg" />

          {scanning && (
            <View
              className="absolute top-1/2 left-0 right-0 h-0.5 bg-amber-400"
              style={{
                transform: [{ translateY: -1 }],
                shadowColor: "#F59E0B",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
              }}
            />
          )}
        </View>

        <Text className="text-white text-center mt-6 mb-8">
          Apunta la cámara al código QR para registrar tu asistencia
        </Text>

        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-white items-center justify-center"
          onPress={handleRescan}
        >
          <View className="w-14 h-14 rounded-full border-2 border-gray-300" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ScanQR

import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Image, Alert, ActivityIndicator } from 'react-native';
import { AntDesign, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { getDatosWithAuth, putDatosWithAuth } from 'api/crud';
import { Contexto } from 'contexto/Provider';
import ConfirmModal from '../../components/common/ConfirmModal';

const BuyCourse = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId, scheduleId } = route.params || {};

  const { userId, token } = useContext(Contexto);

  const [courseData, setCourseData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [onModalConfirm, setOnModalConfirm] = useState(() => () => {});
  const [confirmButtonText, setConfirmButtonText] = useState("Confirmar");

  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState("");
  const [successModalMessage, setSuccessModalMessage] = useState("");

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return "$0";
    }
    return `$${price.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!courseId || !scheduleId || !userId || !token) {
      setError("Faltan datos para cargar la compra del curso.");
      setLoading(false);
      return;
    }

    try {
      const courseRes = await getDatosWithAuth(`course/${courseId}`, 'Error al cargar el curso', token);
      setCourseData(courseRes);

      const foundSchedule = courseRes.cronogramaCursos?.find(s => s.idCronograma === scheduleId);
      setSelectedSchedule(foundSchedule);

      if (!foundSchedule) {
        setError("Cronograma del curso no encontrado.");
        setLoading(false);
        return;
      }

      const studentRes = await getDatosWithAuth(`student/${userId}`, 'Error al cargar datos del estudiante', token);
      setStudentData(studentRes);

    } catch (err) {
      console.error("Error al cargar datos en BuyCourse:", err);
      setError(err.message || "Ocurrió un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, [courseId, scheduleId, userId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const navigateToHomeCursos = useCallback(() => {
    setIsSuccessModalVisible(false);
    navigation.navigate("HomeCourses");
  }, [navigation]);

  const handlePurchaseExecution = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint = "";
      let errorMessage = "";

      if (selectedPaymentMethod === "card") {
        endpoint = `course/agregar_alumno/${selectedSchedule.idCronograma}/${studentData.idAlumno}`;
        errorMessage = "Error al inscribirse con tarjeta";
      } else if (selectedPaymentMethod === "account") {
        endpoint = `course/inscribe-pay-account/${selectedSchedule.idCronograma}/${studentData.idAlumno}`;
        errorMessage = "Error al inscribirse con cuenta corriente";
      } else {
        Alert.alert("Error", "No se ha seleccionado un método de pago.");
        return;
      }

      await putDatosWithAuth(endpoint, {}, errorMessage);

      setSuccessModalTitle("¡Curso Comprado Exitosamente!");
      setSuccessModalMessage(
        `Has sido inscrito en el curso "${courseData.nombreCurso}" en la sede "${selectedSchedule.nombreSede}".`
      );
      setIsSuccessModalVisible(true);

    } catch (err) {
      console.error(`Error al pagar (${selectedPaymentMethod}):`, err);
      Alert.alert("Error", err.message || `No se pudo completar la compra con ${selectedPaymentMethod === "card" ? "tarjeta" : "cuenta corriente"}.`);
    } finally {
      setLoading(false);
      setIsConfirmModalVisible(false);
    }
  }, [selectedPaymentMethod, selectedSchedule, studentData, navigation, courseData]);

  const handleConfirmPaymentButton = () => {
    if (!selectedPaymentMethod) {
      Alert.alert("Información", "Por favor, selecciona un método de pago para continuar.");
      return;
    }

    if (selectedPaymentMethod === "account" && courseData.precio > studentData.cuentaCorriente) {
      Alert.alert("Saldo Insuficiente", `Tu saldo (${formatPrice(studentData.cuentaCorriente)}) es insuficiente para cubrir el precio del curso (${formatPrice(courseData.precio)}).`);
      return;
    }

    setModalTitle("Confirmar Compra");
    setModalMessage(`¿Confirmas la inscripción al curso "${courseData.nombreCurso}" en la sede "${selectedSchedule.nombreSede}" utilizando ${selectedPaymentMethod === 'card' ? 'tarjeta' : 'tu cuenta corriente'}?`);
    setConfirmButtonText("Confirmar Pago");
    setOnModalConfirm(() => handlePurchaseExecution);
    setIsConfirmModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text className="mt-4 text-gray-600">Cargando detalles de compra...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-lg text-center">Error: {error}</Text>
        <TouchableOpacity
          className="mt-6 bg-amber-400 py-3 px-6 rounded-xl"
          onPress={fetchData}
        >
          <Text className="text-white font-bold">Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mt-4 py-2 px-4 rounded-xl border border-gray-300"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-gray-700">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!courseData || !studentData || !selectedSchedule) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-lg text-center">No se pudieron cargar todos los datos necesarios para la compra. Por favor, intente de nuevo.</Text>
        <TouchableOpacity
          className="mt-6 bg-amber-400 py-3 px-6 rounded-xl"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-bold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const hasEnoughBalance = courseData.precio <= studentData.cuentaCorriente;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            className="mr-4 p-2 rounded-full bg-amber-400"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Volver atrás"
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">
            Confirmar Compra
          </Text>
        </View>

        {/* Resumen del Curso */}
        <Text className="text-lg font-bold text-gray-800 mb-2">Detalles del Curso</Text>
        <View className="bg-gray-100 p-4 rounded-lg mb-4">
          <Text className="text-gray-700 font-semibold text-lg mb-1">{courseData.nombreCurso}</Text>
          <View className="flex-row items-center mb-1">
            <MaterialIcons name="location-on" size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-700">Sede: {selectedSchedule.nombreSede}</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <AntDesign name="calendar" size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-700">Inicio: {formatDate(selectedSchedule.fechaInicio)}</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <AntDesign name="book" size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-700">Duración: {courseData.duracion} clases</Text>
          </View>
          <Text className="text-xl font-bold text-amber-500 mt-2">Precio: {formatPrice(courseData.precio)}</Text>
        </View>

        {/* Datos del Estudiante */}
        <Text className="text-lg font-bold text-gray-800 mb-2">Tus Datos</Text>
        <View className="flex-row items-center bg-white p-4 rounded-lg mb-4 border border-gray-200">
          {studentData.usuario?.avatar ? (
            <Image source={{ uri: studentData.usuario.avatar }} className="w-12 h-12 rounded-full mr-4" />
          ) : (
            <View className="w-12 h-12 rounded-full mr-4 bg-gray-300 justify-center items-center">
              <Text className="text-white text-xl font-bold">{studentData.usuario?.nombre?.charAt(0).toUpperCase() || '?'}</Text>
            </View>
          )}
          <View>
            <Text className="text-gray-800 font-bold">{studentData.usuario?.nombre || 'N/A'}</Text>
            <Text className="text-gray-500">{studentData.usuario?.mail || 'N/A'}</Text>
            <Text className="text-gray-500">Saldo Cuenta Corriente: {formatPrice(studentData.cuentaCorriente)}</Text>
          </View>
        </View>

        <Text className="text-lg font-bold text-gray-800 mb-3">Métodos de Pago</Text>

        {/* Opción 1: Pagar con Tarjeta */}
        <TouchableOpacity
          className={`p-4 rounded-lg mb-4 flex-row items-center justify-between ${
            selectedPaymentMethod === 'card' ? 'bg-yellow-50 border border-yellow-400' : 'bg-gray-50 border border-gray-200'
          }`}
          onPress={() => setSelectedPaymentMethod('card')}
          disabled={loading || !studentData.numeroTarjeta}
        >
          <View className="flex-row items-center">
            <FontAwesome5 name="credit-card" size={24} color={selectedPaymentMethod === 'card' ? '#ca8a04' : '#6B7280'} />
            <Text className={`ml-4 ${selectedPaymentMethod === 'card' ? 'text-yellow-600' : 'text-gray-800'}`}>
              Pagar con Tarjeta: {studentData.numeroTarjeta ? `**** **** **** ${studentData.numeroTarjeta.slice(-4)}` : 'No disponible'}
            </Text>
          </View>
          {selectedPaymentMethod === 'card' && <MaterialIcons name="check-circle" size={20} color="#ca8a04" />}
          {!studentData.numeroTarjeta && !loading && (
             <Text className="text-red-500 text-xs absolute right-2 bottom-2">Tarjeta no disponible</Text>
          )}
        </TouchableOpacity>

        {/* Opción 2: Pagar con Cuenta Corriente */}
        <TouchableOpacity
          className={`p-4 rounded-lg mb-4 flex-row items-center justify-between ${
            selectedPaymentMethod === 'account' ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-50 border border-gray-100'
          }`}
          onPress={() => setSelectedPaymentMethod('account')}
          disabled={loading || !hasEnoughBalance}
        >
          <View className="flex-row items-center">
            <FontAwesome5 name="coins" size={24} color={selectedPaymentMethod === 'account' ? '#2563EB' : '#F59E0B'} />
            <Text className={`ml-4 ${selectedPaymentMethod === 'account' ? 'text-blue-800' : 'text-gray-800'}`}>Pagar con Cuenta Corriente</Text>
          </View>
          {selectedPaymentMethod === 'account' && <MaterialIcons name="check-circle" size={20} color="#2563EB" />}
          {!hasEnoughBalance && !loading && (
            <Text className="text-red-500 text-xs absolute right-2 bottom-2">Saldo insuficiente</Text>
          )}
        </TouchableOpacity>

        {/* Botón de Confirmación */}
        <TouchableOpacity
          className={`py-3 rounded-xl items-center mt-4 ${
            selectedPaymentMethod && !loading ? 'bg-amber-400' : 'bg-gray-400'
          }`}
          onPress={handleConfirmPaymentButton}
          disabled={!selectedPaymentMethod || loading}
        >
          <Text className="text-white font-bold text-lg">Confirmar Pago</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirm Modal para la pre-compra */}
      <ConfirmModal
        visible={isConfirmModalVisible}
        title={modalTitle}
        message={modalMessage}
        onCancel={() => setIsConfirmModalVisible(false)}
        onConfirm={onModalConfirm}
        confirmText={confirmButtonText}
        cancelText="Cancelar"
      />

      {/* Confirm Modal para el éxito de la compra */}
      <ConfirmModal
        visible={isSuccessModalVisible}
        title={successModalTitle}
        message={successModalMessage}
        onCancel={navigateToHomeCursos} 
        onConfirm={navigateToHomeCursos}
        cancelText="Ok"
      />
    </SafeAreaView>
  );
};

export default BuyCourse;
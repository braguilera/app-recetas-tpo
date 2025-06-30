import React, { useState, useEffect, useContext, useCallback } from "react"
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { getDatosWithAuth } from "api/crud" 
import { Contexto } from "contexto/Provider"

const MyCount = () => {
    const navigation = useNavigation()
    const insets = useSafeAreaInsets()
    const { userId, token } = useContext(Contexto)

    const [payments, setPayments] = useState([])
    const [accountBalance, setAccountBalance] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Fecha inválida";
        }
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const fetchPayments = useCallback(async () => {
        if (!userId || !token) {
            setError("No se pudo cargar el historial de pagos: ID de usuario o token no disponibles.");
            setLoading(false);
            return;
        }
        try {
            const data = await getDatosWithAuth(`student/${userId}/payments`, 'Error al cargar pagos', token);
            setPayments(data || []);
        } catch (err) {
            console.error("Error fetching payments:", err);
            setError(err.message || "Ocurrió un error al cargar los pagos.");
            setPayments([]);
        }
    }, [userId, token]);

    const fetchAccountBalance = useCallback(async () => {
        if (!userId || !token) {
            return;
        }
        try {
            const studentData = await getDatosWithAuth(`student/${userId}`, 'Error al cargar saldo de cuenta', token);
            setAccountBalance(studentData.cuentaCorriente || 0);
        } catch (err) {
            console.error("Error fetching account balance:", err);
        }
    }, [userId, token]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            await Promise.all([fetchPayments(), fetchAccountBalance()]);
            setLoading(false);
        };

        loadData();
    }, [fetchPayments, fetchAccountBalance]);

    if (loading) {
        return (
            <SafeAreaView className="flex justify-start pt-20 items-center h-screen bg-white">
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text className="mt-4 text-gray-600">Cargando historial de pagos...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white p-4">
                <Text className="text-red-500 text-lg text-center">Error: {error}</Text>
                <TouchableOpacity
                    className="mt-6 bg-amber-400 py-3 px-6 rounded-xl"
                    onPress={() => {
                        setLoading(true);
                        setError(null);
                        fetchPayments();
                        fetchAccountBalance();
                    }}
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

            <ScrollView className="flex-1 p-4">
                <View className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <Text className="text-xl font-bold text-gray-800 mb-2">Saldo en cuenta:</Text>
                    <Text className="text-2xl font-extrabold text-amber-600">{formatPrice(accountBalance)}</Text>
                </View>

                <Text className="text-xl font-bold text-gray-800 mb-4">Pagos realizados:</Text>

                {payments.length === 0 ? (
                    <Text className="text-gray-500 text-center mt-8">No tienes pagos de cursos registrados aún.</Text>
                ) : (
                    <View className="border border-amber-200 rounded-lg overflow-hidden shadow-md">
                        <View className="flex-row bg-amber-200 p-3 border-b border-amber-300">
                            <Text className="flex-1 font-bold text-amber-800 text-center">Fecha</Text>
                            <Text className="flex-1 font-bold text-amber-800 text-center">Curso</Text>
                            <Text className="flex-1 font-bold text-amber-800 text-center">Sede</Text>
                            <Text className="flex-0.7 font-bold text-amber-800 text-right pr-2">Monto</Text>
                        </View>

                        {payments.map((payment, index) => (
                            <View
                                key={index}
                                className={`flex-row p-3 ${index % 2 === 0 ? 'bg-white' : 'bg-amber-50'} ${index === payments.length - 1 ? '' : 'border-b border-amber-100'}`}
                            >
                                <Text className="flex-1 text-gray-800 text-center">{formatDate(payment.fechaInscripcion)}</Text>
                                <Text className="flex-1 text-gray-800 text-center">{payment.nombreCurso}</Text>
                                <Text className="flex-1 text-gray-800 text-center">{payment.sede}</Text>
                                <Text className="flex-0.7 text-gray-800 text-right pr-2">{formatPrice(payment.precio)}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default MyCount;

import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDatosConQueryParams, postDatos, postDatosWithAuth } from "../../api/crud";
import { Ionicons } from "@expo/vector-icons";
import LoadingModal from "../../components/utils/LoadingModal";
import UploadMediaFile from "components/utils/UploadMediaFIle";

const VerifyCode = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { type = "login", email = "", username = "", isStudentRegister: routeIsStudentRegister = false } = route.params || {};


  const [code, setCode] = useState(["", "", "", "", ""]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const dniFrontUploadRef = useRef(null);
  const dniBackUploadRef = useRef(null);
  const [dniFrontImageUri, setDniFrontImageUri] = useState(null);
  const [dniBackImageUri, setDniBackImageUri] = useState(null);
  const [dni, setDni] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Verificando...");

  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); 

  const codeInputs = useRef([]);

  const isRegisterStep2 = type === "registerStep2";
  const shouldShowStudentFields = isRegisterStep2 && routeIsStudentRegister;

  useEffect(() => {
    codeInputs.current[0]?.focus();
  }, []);

  const clearErrors = () => {
    setGeneralError("");
    setFieldErrors({});
  };

  const handleCodeChange = (value, index) => {
    clearErrors(); 
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 4) {
      codeInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    clearErrors();
    setLoadingMessage("Reenviando código...");
    setLoading(true);
    try {
      await getDatosConQueryParams('auth/send-code', { email: email }, 'Error al reenviar el código');
      console.log("Código reenviado exitosamente.");
      setCode(["", "", "", "", ""]);
      codeInputs.current[0]?.focus();
    } catch (error) {
      console.error("Error al reenviar el código:", error);
      setGeneralError(error.message || "No se pudo reenviar el código. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (codeString) => {
    clearErrors();
    let errors = {};
    if (!newPassword) errors.newPassword = "Ingresa tu nueva contraseña.";
    if (!confirmPassword) errors.confirmPassword = "Confirma tu nueva contraseña.";
    if (newPassword !== confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    setLoadingMessage("Restableciendo contraseña...");
    try {
      await postDatosWithAuth(
        'password/confirm-reset',
        { code: codeString, newPassword: newPassword, confirmPassword: confirmPassword },
        'Error al restablecer la contraseña'
      );
      console.log("Contraseña restablecida exitosamente.");
      navigation.replace("Login");
      return true;
    } catch (error) {
      console.error("Error en handlePasswordReset:", error);
      setGeneralError(error.message || "No se pudo restablecer la contraseña.");
      throw error;
    }
  };

  const handleRegisterStep2 = async (codeString) => {
    clearErrors();
    let errors = {};

    if (!firstName) errors.firstName = "El nombre es obligatorio.";
    if (!lastName) errors.lastName = "El apellido es obligatorio.";
    if (!password) errors.password = "La contraseña es obligatoria.";
    if (!rePassword) errors.rePassword = "Confirma tu contraseña.";
    if (password !== rePassword) errors.rePassword = "Las contraseñas no coinciden.";

    if (shouldShowStudentFields) {
      if (!cardNumber) errors.cardNumber = "El número de tarjeta es obligatorio.";
      if (!dni) errors.dni = "El DNI es obligatorio.";
      if (!dniFrontImageUri) errors.dniFrontImage = "La imagen frontal del DNI es obligatoria.";
      if (!dniBackImageUri) errors.dniBackImage = "La imagen trasera del DNI es obligatoria.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    let finalDniFrontPath = null;
    let finalDniBackPath = null;

    try {
      if (shouldShowStudentFields) {
        setLoadingMessage("Cargando...");
        if (dniFrontUploadRef.current) {
          if (dniFrontUploadRef.current.hasChanges() || !dniFrontImageUri?.startsWith('http')) {
            const uploadResult = await dniFrontUploadRef.current.upload();
            if (uploadResult && uploadResult.path) {
              finalDniFrontPath = uploadResult.path;
            } else {
              setGeneralError("No se pudo subir la imagen frontal del DNI.");
              return false;
            }
          } else {
            finalDniFrontPath = dniFrontUploadRef.current.uploadedMediaInfo?.path || dniFrontImageUri;
          }
        } else {
          setGeneralError("Referencia a DNI Frente no disponible. (Error interno)");
          return false;
        }

        if (dniBackUploadRef.current) {
          if (dniBackUploadRef.current.hasChanges() || !dniBackImageUri?.startsWith('http')) {
            const uploadResult = await dniBackUploadRef.current.upload();
            if (uploadResult && uploadResult.path) {
              finalDniBackPath = uploadResult.path;
            } else {
              setGeneralError("No se pudo subir la imagen trasera del DNI.");
              return false;
            }
          } else {
            finalDniBackPath = dniBackUploadRef.current.uploadedMediaInfo?.path || dniBackImageUri;
          }
        } else {
          setGeneralError("Referencia a DNI Dorso no disponible. (Error interno)");
          return false;
        }
      }

      setLoadingMessage("Finalizando registro...");

      const userDTO = {
        verificationCode: codeString,
        firstname: firstName,
        lastname: lastName,
        password: password,
        rePassword: rePassword,
      };

      console.log("Datos del registro (userDTO):", userDTO);

      let endpoint = "";
      let requestBody = {};

      if (shouldShowStudentFields) {
        endpoint = "register/step2/student";
        requestBody = {
          userDTO: userDTO,
          studentDto: {
            numeroTarjeta: cardNumber,
            dniFrente: finalDniFrontPath,
            dniDorso: finalDniBackPath,
            tramite: dni,
          },
        };
      } else {
        endpoint = "register/step2/user";
        requestBody = userDTO;
      }

      console.log(`Enviando a ${endpoint}:`, requestBody);

      await postDatos(
        endpoint,
        requestBody,
        `Error al completar el registro como ${shouldShowStudentFields ? "estudiante" : "usuario"}`
      );

      console.log(`Registro completado exitosamente en ${endpoint}.`);
      navigation.replace("SuccessScreen", {
        type: "newAccount",
      });
      return true;

    } catch (error) {
      console.error("Error en handleRegisterStep2:", error);
      setGeneralError(error.message || `No se pudo completar el registro como ${shouldShowStudentFields ? "estudiante" : "usuario"}.`);
      throw error;
    }
  };

  const handleSubmit = async () => {
    clearErrors(); 
    const codeString = code.join("");

    if (codeString.length !== 5) {
      setFieldErrors(prev => ({ ...prev, code: "Ingresa el código completo (5 caracteres)." }));
      return;
    }

    setLoading(true);

    try {
      if (type === "passwordReset") {
        await handlePasswordReset(codeString);
      } else if (isRegisterStep2) {
        await handleRegisterStep2(codeString);
      } else {
        console.log("Código verificado (flujo general). Redirigiendo a Login.");
        navigation.replace("Login");
      }
    } catch (error) {
      console.error("Error en handleSubmit (VerifyCode - Catch principal):", error);
      if (!generalError) {
          setGeneralError(error.message || 'Ocurrió un error inesperado. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (isRegisterStep2) {
      return shouldShowStudentFields ? "Registro de Estudiante" : "Registro";
    }
    switch (type) {
      case "registerVerification":
        return "Verificar Registro";
      case "forgotPassword":
        return "Verificar Código";
      case "passwordReset":
        return "Restablecer Contraseña";
      default:
        return "Verificar Código";
    }
  };

  const getButtonText = () => {
    if (isRegisterStep2) {
      return shouldShowStudentFields ? "Finalizar Registro Estudiante" : "Finalizar Registro";
    }
    switch (type) {
      case "registerVerification":
        return "Confirmar Registro";
      case "forgotPassword":
        return "Verificar";
      case "passwordReset":
        return "Restablecer Contraseña";
      default:
        return "Verificar";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF3E2", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />

      <View className="flex-row items-center p-4">
        <TouchableOpacity
          className="bg-amber-500 rounded-full p-2 mr-4"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver atrás"
        >
          <AntDesign name="arrowleft" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">{getTitle()}</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="items-center mb-8">
          <Text className="text-lg font-medium text-gray-800 mb-4 text-center">
            {isRegisterStep2
              ? `Ingresa el código enviado a ${email} y completa tus datos:`
              : type === "passwordReset"
                ? "Ingresa el código enviado a tu correo y tu nueva contraseña"
                : `Ingresa el código enviado a ${email}`}
          </Text>
          <View className="flex-row justify-center space-x-3">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (codeInputs.current[index] = ref)}
                className={`w-14 h-14 bg-white border-2 rounded-xl text-center text-xl font-bold text-gray-800 shadow-sm ${fieldErrors.code ? 'border-red-500' : 'border-gray-200'}`}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="numeric"
                autoCapitalize="none"
                selectTextOnFocus
              />
            ))}
          </View>
          {fieldErrors.code && <Text className="text-red-500 text-sm mt-2 mb-4 ml-5">{fieldErrors.code}</Text>}
        </View>

        {generalError ? (
          <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
            <Text className="font-bold text-red-700">Error:</Text>
            <Text className="text-sm text-red-700">{generalError}</Text>
          </View>
        ) : null}

        {isRegisterStep2 && ( 
          <View className="mt-4">
            <Text className="text-gray-700 font-medium mb-2">Nombre</Text>
            <TextInput
              className={`border rounded-xl px-4 py-2 mb-1 text-gray-800 bg-gray-50 ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ingresa tu nombre"
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={(text) => { setFirstName(text); clearErrors(); }}
              editable={!loading}
            />
            {fieldErrors.firstName && <Text className="text-red-500 text-sm mt-2 mb-4 ml-5">{fieldErrors.firstName}</Text>}

            <Text className="text-gray-700 font-medium mb-2 mt-3">Apellido</Text>
            <TextInput
              className={`border rounded-xl px-4 py-2 mb-1 text-gray-800 bg-gray-50 ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ingresa tu apellido"
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={(text) => { setLastName(text); clearErrors(); }}
              editable={!loading}
            />
            {fieldErrors.lastName && <Text className="text-red-500 text-sm mt-2 mb-4 ml-5">{fieldErrors.lastName}</Text>}

            <Text className="text-gray-700 font-medium mb-2 mt-3">Contraseña</Text>
            <TextInput
              className={`border rounded-xl px-4 py-2 mb-1 text-gray-800 bg-gray-50 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(text) => { setPassword(text); clearErrors(); }}
              secureTextEntry
              editable={!loading}
            />
            {fieldErrors.password && <Text className="text-red-500 text-sm mt-2 mb-4 ml-5">{fieldErrors.password}</Text>}

            <Text className="text-gray-700 font-medium mb-2 mt-3">Repetir Contraseña</Text>
            <TextInput
              className={`border rounded-xl px-4 py-2 mb-1 text-gray-800 bg-gray-50 ${fieldErrors.rePassword ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={rePassword}
              onChangeText={(text) => { setRePassword(text); clearErrors(); }}
              secureTextEntry
              editable={!loading}
            />
            {fieldErrors.rePassword && <Text className="text-red-500 text-sm mt-2 mb-4 ml-5">{fieldErrors.rePassword}</Text>}

            {shouldShowStudentFields && (
              <View>
                <Text className="text-gray-700 font-medium mb-2 mt-3">
                  Número de tarjeta
                </Text>
                <TextInput
                  className={`border rounded-xl px-4 py-2 mb-1 text-gray-800 bg-gray-50 ${fieldErrors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ingresa tu número de tarjeta"
                  placeholderTextColor="#9CA3AF"
                  value={cardNumber}
                  maxLength={12}
                  onChangeText={(text) => { setCardNumber(text); clearErrors(); }}
                  keyboardType="numeric"
                  editable={!loading}
                />
                {fieldErrors.cardNumber && <Text className="text-red-500 text-sm mt-2 mb-4 ml-5">{fieldErrors.cardNumber}</Text>}

                <Text className="text-gray-700 font-medium mb-2 mt-3">DNI Frente</Text>
                <UploadMediaFile
                  ref={dniFrontUploadRef}
                  initialImageUri={dniFrontImageUri}
                  onImageChange={(uri) => { setDniFrontImageUri(uri); clearErrors(); }}
                />
                {fieldErrors.dniFrontImage && <Text className="text-red-500 text-sm mt-2 mb-4 ml-5">{fieldErrors.dniFrontImage}</Text>}

                <Text className="text-gray-700 font-medium mb-2 mt-4">DNI Dorso</Text>
                <UploadMediaFile
                  ref={dniBackUploadRef}
                  initialImageUri={dniBackImageUri}
                  onImageChange={(uri) => { setDniBackImageUri(uri); clearErrors(); }}
                />
                {fieldErrors.dniBackImage && <Text className="text-red-500 text-sm mt-2 mb-4 ml-5">{fieldErrors.dniBackImage}</Text>}

                <Text className="text-gray-700 font-medium mb-2 mt-4">DNI</Text>
                <TextInput
                  className={`border rounded-xl px-4 py-2 mb-1 text-gray-800 bg-gray-50 ${fieldErrors.dni ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ingresa tu DNI"
                  placeholderTextColor="#9CA3AF"
                  value={dni}
                  maxLength={11}
                  onChangeText={(text) => { setDni(text); clearErrors(); }}
                  keyboardType="numeric"
                  editable={!loading}
                />
                {fieldErrors.dni && <Text className="text-red-500 text-sm mt-2 mb-4 ml-5">{fieldErrors.dni}</Text>}
              </View>
            )}
          </View>
        )}

        {type === "passwordReset" && (
          <View className="mt-8">
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-3">Nueva contraseña</Text>
              <View className="relative">
                <TextInput
                  className={`bg-gray-200 rounded-lg px-4 py-4 pr-12 text-gray-800 text-base ${fieldErrors.newPassword ? 'border border-red-500' : ''}`}
                  placeholder="Ingresa tu nueva contraseña"
                  placeholderTextColor="#9CA3AF"
                  value={newPassword}
                  onChangeText={(text) => { setNewPassword(text); clearErrors(); }}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity className="absolute right-4 top-4" onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              {fieldErrors.newPassword && <Text className="text-red-500 text-sm mt-2 mb-4 ml-5">{fieldErrors.newPassword}</Text>}
            </View>

            <View className="mb-8">
              <Text className="text-gray-700 font-medium mb-3">Verificar contraseña</Text>
              <View className="relative">
                <TextInput
                  className={`bg-gray-200 rounded-lg px-4 py-4 pr-12 text-gray-800 text-base ${fieldErrors.confirmPassword ? 'border border-red-500' : ''}`}
                  placeholder="Confirma tu nueva contraseña"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={(text) => { setConfirmPassword(text); clearErrors(); }}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              {fieldErrors.confirmPassword && <Text className="text-red-500 mt-2 mb-4 ml-5 text-sm">{fieldErrors.confirmPassword}</Text>}
            </View>
          </View>
        )}

        <View className="mt-auto pb-8">
          {type !== "passwordReset" && (
            <TouchableOpacity className="items-center mb-4" onPress={handleResendCode} disabled={loading}>
              <Text className="text-gray-600 underline">Reenviar código</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity className="bg-amber-400 rounded-lg py-4 items-center" onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">{getButtonText()}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <LoadingModal visible={loading} message={loadingMessage} />
    </View>
  );
};

export default VerifyCode;
import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Contexto } from "../../contexto/Provider";
import { putDatosWithAuth, postDatosWithAuth, getDatosWithAuth } from "../../api/crud";
import UploadMediaFile from "../../components/utils/UploadMediaFIle";
import LoadingModal from "../../components/utils/LoadingModal";

const EditProfile = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { userId, username, firstName, lastName, email, isStudent, token, setIsStudentStatus } =
    useContext(Contexto);

  // Estados inicializados con los datos del contexto
  const [profileFirstName, setProfileFirstName] = useState(firstName || "");
  const [profileLastName, setProfileLastName] = useState(lastName || "");
  const [profileNickname, setProfileNickname] = useState(username || "");
  const [profileEmail, setProfileEmail] = useState(email || "");
  const [profileAvatar, setProfileAvatar] = useState(null);

  const [isStudentUser, setIsStudentUser] = useState(isStudent);

  // ESTADOS PARA DATOS ESPECÍFICOS DEL ESTUDIANTE
  const [studentCardNumber, setStudentCardNumber] = useState("");
  const [studentDni, setStudentDni] = useState("");
  const [studentDniFrontImageUri, setStudentDniFrontImageUri] = useState(null);
  const [studentDniBackImageUri, setStudentDniBackImageUri] = useState(null);
  const [studentTramite, setStudentTramite] = useState("");
  const [studentCuentaCorriente, setStudentCuentaCorriente] = useState(0);

  // Estados para contraseñas
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Estados para el popup de mejora a estudiante
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeCardNumber, setUpgradeCardNumber] = useState("");
  const [upgradeDni, setUpgradeDni] = useState("");
  const [upgradeDniFrontImageUri, setUpgradeDniFrontImageUri] = useState(null);
  const [upgradeDniBackImageUri, setUpgradeDniBackImageUri] = useState(null);

  // Referencias para los componentes UploadMediaFile
  const dniFrontUploadRef = useRef(null);
  const dniBackUploadRef = useRef(null);
  const tempAvatarUploadRef = useRef(null);

  // Estados de UI/UX
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [showAvatarChangeModal, setShowAvatarChangeModal] = useState(false);
  const [tempAvatarUri, setTempAvatarUri] = useState(null);


  const clearErrors = () => {
    setGeneralError("");
    setFieldErrors({});
  };

  useEffect(() => {
    setIsStudentUser(isStudent);

    const fetchStudentSpecificData = async () => {
      if (isStudent && userId) {
        setLoadingMessage("Cargando datos de estudiante...");
        setLoading(true);
        try {
          const studentDetails = await getDatosWithAuth(`student/${userId}`, "Error al cargar datos de estudiante", token);

          if (studentDetails) {
            setStudentCardNumber(studentDetails.numeroTarjeta || "");
            setStudentDni(studentDetails.dni || "");
            setStudentDniFrontImageUri(studentDetails.dniFrente || null);
            setStudentDniBackImageUri(studentDetails.dniFondo || null);
            setStudentTramite(studentDetails.tramite || "");
            setStudentCuentaCorriente(studentDetails.cuentaCorriente || 0);
          } else {
            resetStudentData();
          }
        } catch (error) {
          console.error("Error al cargar datos específicos de estudiante en EditProfile:", error);
          setGeneralError("No se pudieron cargar los datos adicionales de estudiante. Intenta de nuevo.");
          resetStudentData();
        } finally {
          setLoading(false);
        }
      } else {
        resetStudentData();
      }
    };

    fetchStudentSpecificData();
  }, [isStudent, userId, token]);

  const resetStudentData = () => {
    setStudentCardNumber("");
    setStudentDni("");
    setStudentDniFrontImageUri(null);
    setStudentDniBackImageUri(null);
    setStudentTramite("");
    setStudentCuentaCorriente(0);
  };

  const handleSaveChanges = async () => {
    clearErrors();
    let errors = {};

    if (!profileFirstName.trim()) errors.profileFirstName = "El nombre es obligatorio.";
    if (!profileLastName.trim()) errors.profileLastName = "El apellido es obligatorio.";
    if (!profileNickname.trim()) errors.profileNickname = "El nickname es obligatorio.";
    if (!profileEmail.trim()) errors.profileEmail = "El correo es obligatorio.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileEmail))
      errors.profileEmail = "Ingresa un correo electrónico válido.";

    if (newPassword || confirmNewPassword) {
      if (newPassword.length < 6)
        errors.newPassword = "La nueva contraseña debe tener al menos 6 caracteres.";
      if (newPassword !== confirmNewPassword)
        errors.confirmNewPassword = "Las nuevas contraseñas no coinciden.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoadingMessage("Actualizando perfil...");
    setLoading(true);

    try {
      const userUpdateDTO = {
        firstName: profileFirstName,
        lastName: profileLastName,
        nickname: profileNickname,
        email: profileEmail,
      };

      if (newPassword) {
        userUpdateDTO.newPassword = newPassword;
      }

      console.log(`Enviando actualización a user/${userId}:`, userUpdateDTO);
      await putDatosWithAuth(
        `user/${userId}`,
        userUpdateDTO,
        "Error al actualizar el perfil",
        token
      );

      Alert.alert("Éxito", "Perfil actualizado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      setGeneralError(
        error.message || "Ocurrió un error al actualizar el perfil."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToStudent = async () => {
    clearErrors();
    let errors = {};

    if (!upgradeCardNumber.trim()) errors.cardNumber = "El número de tarjeta es obligatorio.";
    if (!upgradeDni.trim()) errors.dni = "El DNI es obligatorio.";
    if (!upgradeDniFrontImageUri)
      errors.dniFrontImage = "La imagen frontal del DNI es obligatoria.";
    if (!upgradeDniBackImageUri)
      errors.dniBackImage = "La imagen trasera del DNI es obligatoria.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoadingMessage("Tramitando mejora a estudiante...");
    setLoading(true);

    try {
      let finalDniFrontPath = null;
      let finalDniBackPath = null;

      if (dniFrontUploadRef.current && dniFrontUploadRef.current.hasChanges()) {
        setLoadingMessage("Subiendo DNI Frente...");
        const uploadResult = await dniFrontUploadRef.current.upload();
        if (uploadResult && uploadResult.path) {
          finalDniFrontPath = uploadResult.path;
        } else {
          throw new Error("No se pudo subir la imagen frontal del DNI.");
        }
      } else if (upgradeDniFrontImageUri && !dniFrontUploadRef.current?.hasChanges()) {
        finalDniFrontPath = upgradeDniFrontImageUri;
      }


      if (dniBackUploadRef.current && dniBackUploadRef.current.hasChanges()) {
        setLoadingMessage("Subiendo DNI Dorso...");
        const uploadResult = await dniBackUploadRef.current.upload();
        if (uploadResult && uploadResult.path) {
          finalDniBackPath = uploadResult.path;
        } else {
          throw new Error("No se pudo subir la imagen trasera del DNI.");
        }
      } else if (upgradeDniBackImageUri && !dniBackUploadRef.current?.hasChanges()) {
        finalDniBackPath = upgradeDniBackImageUri;
      }

      const studentUpgradeDTO = {
        numeroTarjeta: upgradeCardNumber,
        dniFrente: finalDniFrontPath,
        dniDorso: finalDniBackPath,
        tramite: upgradeDni,
      };

      console.log(`Enviando mejora a student/upgrade/${userId}:`, studentUpgradeDTO);
      await postDatosWithAuth(
        `student/upgrade/${userId}`,
        studentUpgradeDTO,
        "Error al mejorar a estudiante",
        token
      );

      await setIsStudentStatus(true);

      setShowUpgradeModal(false);
      Alert.alert(
        "Éxito",
        "¡Tu perfil ha sido mejorado a estudiante con éxito!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error al mejorar a estudiante:", error);
      setGeneralError(
        error.message || "Ocurrió un error al intentar mejorar a estudiante."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAvatarChange = async () => {
    clearErrors();
    setLoadingMessage("Actualizando avatar...");
    setLoading(true);
    try {
      let finalAvatarPath = profileAvatar;

      if (tempAvatarUploadRef.current && tempAvatarUploadRef.current.hasChanges()) {
        // Lógica de subida futura del avatar
        // const uploadResult = await tempAvatarUploadRef.current.upload();
        // if (uploadResult && uploadResult.path) {
        //   finalAvatarPath = uploadResult.path;
        // } else {
        //   throw new Error("No se pudo subir la nueva imagen de perfil.");
        // }
         Alert.alert("Información", "La funcionalidad de cambio de avatar no está habilitada completamente aún.", [{ text: "OK", onPress: () => {
          setShowAvatarChangeModal(false);
          setTempAvatarUri(null);
        }}]);
        return;
      } else if (!tempAvatarUri && tempAvatarUploadRef.current?.hasChanges() === false) {
          finalAvatarPath = null;
      }

      Alert.alert("Información", "La funcionalidad de cambio de avatar no está implementada completamente aún.", [{ text: "OK", onPress: () => {
        setShowAvatarChangeModal(false);
        setTempAvatarUri(null);
      }}]);
    } catch (error) {
      console.error("Error al actualizar el avatar:", error);
      setGeneralError(error.message || "Error al actualizar el avatar.");
    } finally {
      setLoading(false);
    }
  };

  const renderUserAvatar = () => {
    const hasAvatar = profileAvatar && profileAvatar.trim() !== '';

    return (
      <View className="w-28 h-28 rounded-full overflow-hidden items-center justify-center bg-gray-300 border-2 border-amber-400">
        {hasAvatar ? (
          <Image source={{ uri: profileAvatar }} className="w-full h-full object-cover" />
        ) : (
          <AntDesign name="user" size={50} color="white" />
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#FEF3E2]" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF3E2" />
      <LoadingModal visible={loading} message={loadingMessage} />

      <View className="flex-row items-center p-4 ">
        <TouchableOpacity
          className="mr-4 p-1"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver atrás"
        >
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 flex-1">
          Editar Perfil
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="items-center mb-6 relative">
          {renderUserAvatar()}
          <TouchableOpacity
            className="absolute top-0 right-[30%] bg-amber-500 p-2 rounded-full shadow-md z-10"
            onPress={() => {
              clearErrors();
              setTempAvatarUri(profileAvatar);
              setShowAvatarChangeModal(true);
            }}
          >
            <Feather name="edit-2" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <Text className="text-gray-700 text-base mb-4 text-center">
            Aquí puedes cambiar tus datos de perfil.
        </Text>

        {generalError ? (
          <View
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4"
            role="alert"
          >
            <Text className="font-bold text-red-700">Error:</Text>
            <Text className="text-sm text-red-700">{generalError}</Text>
          </View>
        ) : null}

        {!isStudentUser && (
          <TouchableOpacity
            className="bg-white border border-amber-500 rounded-xl py-3 items-center mt-4 mb-6 shadow-sm"
            onPress={() => {
              clearErrors();
              setShowUpgradeModal(true);
              setUpgradeCardNumber("");
              setUpgradeDni("");
              setUpgradeDniFrontImageUri(null);
              setUpgradeDniBackImageUri(null);
            }}
            disabled={loading}
          >
            <Text className="text-amber-600 font-semibold text-base">
              Mejorar a Estudiante
            </Text>
          </TouchableOpacity>
        )}

        <View className="space-y-5 mb-6">
          <View>
            <Text className="text-gray-700 font-medium mb-2">Nombre</Text>
            <TextInput
              className={`bg-white border rounded-xl px-4 py-3 text-gray-800 ${fieldErrors.profileFirstName ? 'border-red-500' : 'border-gray-200'}`}
              value={profileFirstName}
              onChangeText={(text) => {setProfileFirstName(text); clearErrors();}}
              placeholder={firstName}
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
            {fieldErrors.profileFirstName && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.profileFirstName}</Text>}
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Apellido</Text>
            <TextInput
              className={`bg-white border rounded-xl px-4 py-3 text-gray-800 ${fieldErrors.profileLastName ? 'border-red-500' : 'border-gray-200'}`}
              value={profileLastName}
              onChangeText={(text) => {setProfileLastName(text); clearErrors();}}
              placeholder={lastName}
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
            {fieldErrors.profileLastName && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.profileLastName}</Text>}
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Nickname</Text>
            <TextInput
              className={`bg-white border rounded-xl px-4 py-3 text-gray-800 ${fieldErrors.profileNickname ? 'border-red-500' : 'border-gray-200'}`}
              value={profileNickname}
              onChangeText={(text) => {setProfileNickname(text); clearErrors();}}
              placeholder={username}
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
            {fieldErrors.profileNickname && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.profileNickname}</Text>}
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Correo Electrónico</Text>
            <TextInput
              className={`bg-white border rounded-xl px-4 py-3 text-gray-800 ${fieldErrors.profileEmail ? 'border-red-500' : 'border-gray-200'}`}
              value={profileEmail}
              onChangeText={(text) => {setProfileEmail(text); clearErrors();}}
              placeholder={email}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {fieldErrors.profileEmail && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.profileEmail}</Text>}
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Nueva Contraseña</Text>
            <View className="relative">
              <TextInput
                className={`bg-white border rounded-xl px-4 py-3 text-gray-800 pr-12 ${fieldErrors.newPassword ? 'border-red-500' : 'border-gray-200'}`}
                value={newPassword}
                onChangeText={(text) => {setNewPassword(text); clearErrors();}}
                placeholder="Deja vacío para no cambiar"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
                editable={!loading}
              />
              <TouchableOpacity className="absolute right-4 top-3" onPress={() => setShowNewPassword(!showNewPassword)}>
                <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            {fieldErrors.newPassword && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.newPassword}</Text>}
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Confirmar Nueva Contraseña</Text>
            <View className="relative">
              <TextInput
                className={`bg-white border rounded-xl px-4 text-gray-800 pr-12 ${fieldErrors.confirmNewPassword ? 'border-red-500' : 'border-gray-200'}`}
                value={confirmNewPassword}
                onChangeText={(text) => {setConfirmNewPassword(text); clearErrors();}}
                placeholder="Confirma tu nueva contraseña"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmNewPassword}
                editable={!loading}
              />
              <TouchableOpacity className="absolute right-4 top-3" onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                <Ionicons name={showConfirmNewPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            {fieldErrors.confirmNewPassword && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.confirmNewPassword}</Text>}
          </View>
        </View>

        {/* Sección de Datos de Estudiante - MOVIDA AL FINAL */}
        {isStudentUser && (
          <View>
            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-medium mb-2">Número de Tarjeta</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  value={studentCardNumber}
                  editable={false}
                  placeholder="N/A"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Número de Trámite</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  value={studentTramite}
                  editable={false}
                  placeholder="N/A"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {studentDniFrontImageUri && (
                <View>
                  <Text className="text-gray-700 font-medium mb-2">DNI Frente</Text>
                  <Image source={{ uri: studentDniFrontImageUri }} className="w-full h-40 rounded-lg mb-2" resizeMode="contain" />
                </View>
              )}
              {studentDniBackImageUri && (
                <View>
                  <Text className="text-gray-700 font-medium mb-2">DNI Dorso</Text>
                  <Image source={{ uri: studentDniBackImageUri }} className="w-full h-40 rounded-lg mb-2" resizeMode="contain" />
                </View>
              )}
            </View>
          </View>
        )}

        
        <TouchableOpacity
          className="bg-amber-500 rounded-xl py-4 items-center mt-4 mb-8 shadow-lg"
          onPress={handleSaveChanges}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Guardar Cambios
            </Text>
          )}
        </TouchableOpacity>

        <View className="h-12" />
      </ScrollView>

      {/* Modal para Mejorar a Estudiante */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showUpgradeModal}
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/60"
          onPress={(event) => event.target == event.currentTarget && setShowUpgradeModal(false)}
        >
          <View className="m-5 w-[90%] max-h-[90%] bg-white rounded-2xl p-6 shadow-xl items-center">
            <Text className="text-2xl font-bold text-amber-800 mb-5 text-center">
              Mejorar a Estudiante
            </Text>
            <Text className="text-gray-700 text-base mb-6 text-center">
              Completa estos datos para acceder a beneficios exclusivos.
            </Text>

            <ScrollView className="w-full">
              <View className="space-y-4">
                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Número de Tarjeta
                  </Text>
                  <TextInput
                    className={`bg-gray-50 border rounded-xl px-4 py-3 text-gray-800 ${fieldErrors.cardNumber ? 'border-red-500' : 'border-gray-200'}`}
                    value={upgradeCardNumber}
                    onChangeText={(text) => {setUpgradeCardNumber(text); clearErrors();}}
                    placeholder="Ej: 1234-5678-9012-3456"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    editable={!loading}
                  />
                  {fieldErrors.cardNumber && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.cardNumber}</Text>}
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2">DNI Frente</Text>
                  <UploadMediaFile
                    ref={dniFrontUploadRef}
                    initialImageUri={upgradeDniFrontImageUri}
                    onImageChange={(uri) => { setUpgradeDniFrontImageUri(uri); clearErrors(); }}
                    buttonText="Seleccionar Imagen Frontal"
                    loadingText="Subiendo DNI Frente..."
                    errorText={fieldErrors.dniFrontImage}
                  />
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2 mt-4">DNI Dorso</Text>
                  <UploadMediaFile
                    ref={dniBackUploadRef}
                    initialImageUri={upgradeDniBackImageUri}
                    onImageChange={(uri) => { setUpgradeDniBackImageUri(uri); clearErrors(); }}
                    buttonText="Seleccionar Imagen Trasera"
                    loadingText="Subiendo DNI Dorso..."
                    errorText={fieldErrors.dniBackImage}
                  />
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2 mt-4">Número de Trámite del DNI</Text>
                  <TextInput
                    className={`bg-gray-50 border rounded-xl px-4 py-3 text-gray-800 ${fieldErrors.dni ? 'border-red-500' : 'border-gray-200'}`}
                    value={upgradeDni}
                    onChangeText={(text) => {setUpgradeDni(text); clearErrors();}}
                    placeholder="Ingresa los 11 dígitos del trámite"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    editable={!loading}
                  />
                  {fieldErrors.dni && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.dni}</Text>}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              className="bg-amber-600 rounded-xl py-4 items-center mt-8 shadow-lg w-full"
              onPress={handleUpgradeToStudent}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Confirmar Mejora
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 py-3 items-center rounded-xl border border-gray-300 w-full"
              onPress={() => {
                setShowUpgradeModal(false);
                clearErrors();
              }}
              disabled={loading}
            >
              <Text className="text-gray-700 font-semibold text-base">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Modal para Cambiar Avatar */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAvatarChangeModal}
        onRequestClose={() => {
          setShowAvatarChangeModal(false);
          setTempAvatarUri(null);
          clearErrors();
        }}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/60"
          onPress={(event) => event.target == event.currentTarget && setShowAvatarChangeModal(false)}
        >
          <View className="m-5 w-[90%] bg-white rounded-2xl p-6 shadow-xl items-center">
            <Text className="text-2xl font-bold text-gray-800 mb-5 text-center">
              Cambiar Avatar
            </Text>
            <Text className="text-gray-700 text-base mb-6 text-center">
              Selecciona una nueva imagen para tu perfil.
            </Text>

            <View className="w-40 h-40 rounded-full overflow-hidden items-center justify-center bg-gray-200 border-2 border-gray-300 mb-6">
              {tempAvatarUri ? (
                <Image source={{ uri: tempAvatarUri }} className="w-full h-full object-cover" />
              ) : (
                <AntDesign name="user" size={70} color="#9CA3AF" />
              )}
            </View>

            <UploadMediaFile
              ref={tempAvatarUploadRef}
              initialImageUri={tempAvatarUri}
              onImageChange={(uri) => { setTempAvatarUri(uri); clearErrors(); }}
              buttonText="Seleccionar Nueva Imagen"
              loadingText="Cargando imagen..."
              errorText={fieldErrors.avatar}
            />

            <TouchableOpacity
              className="bg-amber-500 rounded-xl py-4 items-center mt-6 shadow-lg w-full"
              onPress={handleConfirmAvatarChange}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Confirmar Avatar
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 py-3 items-center rounded-xl border border-gray-300 w-full"
              onPress={() => {
                setShowAvatarChangeModal(false);
                setTempAvatarUri(null);
                clearErrors();
              }}
              disabled={loading}
            >
              <Text className="text-gray-700 font-semibold text-base">Cancelar</Text>
            </TouchableOpacity>

            {profileAvatar && (
                <TouchableOpacity
                    className="mt-4 py-3 items-center rounded-xl border border-red-400 bg-red-100 w-full"
                    onPress={() => {
                        Alert.alert(
                            "Confirmar",
                            "¿Estás seguro de que quieres quitar tu avatar?",
                            [{ text: "No", style: "cancel" }, { text: "Sí", onPress: () => {
                                setTempAvatarUri(null);
                                tempAvatarUploadRef.current?.clearChanges();
                                handleConfirmAvatarChange(); // Esto también dará el mensaje temporal
                            }}
                        ]
                        );
                    }}
                    disabled={loading}
                >
                    <Text className="text-red-600 font-semibold text-base">Quitar Avatar</Text>
                </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default EditProfile;
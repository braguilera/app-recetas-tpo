import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import LogVerificator from '../common/LogVerificator'; 

const CourseCardHome = ({ course, logeado, isStudent }) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  // Navegacion segun el estado del usuario
  const handleCardPress = () => {
    if (!logeado) {
      navigation.navigate("AuthStack", { screen: "Login" }); 
    } else if (!isStudent) {
      setModalVisible(true);
    } else {
      navigation.navigate("DetailsCourses", { courseId: course.idCurso });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const goToProfile = () => {
    setModalVisible(false);
    navigation.navigate("ProfileStack", { screen: "EditProfile" }); 
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-md overflow-hidden mb-4 border border-gray-200" 
      onPress={handleCardPress}
    >
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">{course.nombreCurso}</Text>
          </View>
          {course.modalidad && ( 
            <View className="bg-amber-50 rounded-md px-3 mb-2 flex-row items-center w-28 ">
              <MaterialIcons
                name={course.modalidad.toLowerCase() === "presencial" ? "location-on" : "laptop"}
                size={12}
                color="#f59e0b"
              />
              <Text className="text-xs text-amber-600 ml-1">
                {course.modalidad}
              </Text>
            </View>
          )}
        </View>

        <View className="w-full">
          <View className="bg-gray-100 w-full rounded-md px-3 py-2 mr-2 mb-2 flex-row items-center">
            <Text className="text-xs text-gray-600 ml-2">
              {course.descripcion || 'No hay descripción disponible.'}
            </Text>
          </View>
        </View>


        <View className="flex-row mt-2">
          <View className="flex-1">
            {logeado && isStudent ? (
              <LogVerificator
                onPress={() => navigation.navigate("DetailsCourses", { courseId: course.idCurso })} 
                className="bg-amber-400 w-full px-4 py-2 rounded-md mr-2"
                loginRequiredMessage="Para inscribirte en un curso, necesitas iniciar sesión."
              >
                <Text className="text-white text-center font-bold">Inscribirse</Text>
              </LogVerificator>
            ) : (
              <Text className="text-gray-500 text-center text-sm">
                Solo estudiantes pueden inscribirse
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Modal para cuando no es estudiante */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Pressable className="flex-1 justify-center items-center bg-black/50" onPress={closeModal}>
          <View className="bg-white rounded-lg p-6 w-4/5 shadow-xl">
            <Text className="text-lg font-bold mb-4 text-gray-800">Actualiza tu perfil</Text>
            <Text className="text-base text-gray-600 mb-6">
              Para acceder a la inscripción de cursos, necesitas actualizar tu perfil a un rol de estudiante.
            </Text>
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={closeModal}
                className="bg-gray-200 px-4 py-2 rounded-md mr-2"
              >
                <Text className="text-gray-700 font-semibold">Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goToProfile}
                className="bg-amber-500 px-4 py-2 rounded-md"
              >
                <Text className="text-white font-semibold">Ir a Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </TouchableOpacity>
  );
};

export default CourseCardHome;
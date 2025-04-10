import React from 'react'
import { Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'


const HomeCourses = () => {
  const navigation = useNavigation();


  return (
    <View className='w-full h-full flex justify-center items-center'>
        <Text>Cursos</Text>
        <Text onPress={()=> navigation.navigate("StackCourses")}>Ver Cursos</Text>
        
    </View>
      
  )
}

export default HomeCourses

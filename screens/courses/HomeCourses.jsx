import React from 'react'
import { Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import CommonButton from 'components/common/CommonButton';


const HomeCourses = () => {
  const navigation = useNavigation();


  return (
    <View className='w-full h-full flex justify-center items-center'>
        <Text>Cursos</Text>
        <CommonButton
          onPress={()=> navigation.navigate("StackCourses")}
          text="Ver cursos"
        />
    </View>
      
  )
}

export default HomeCourses

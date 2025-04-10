import React from 'react'
import { Button, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const HomeRecipes = () => {
  const navigation = useNavigation();

  return (
    <View className='w-full h-full flex justify-center items-center'>
        <Text>Rcetas</Text>
        <Text onPress={()=> navigation.navigate("StackRecipes")}>Ver recetas</Text>
    </View>
  )
}

export default HomeRecipes

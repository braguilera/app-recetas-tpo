import React from 'react'
import { Pressable, Text } from 'react-native'

const CommonButton = ({text, onPress}) => {
  return (
    <Pressable onPress={onPress}>
        <Text>{text}</Text>
    </Pressable>
  )
}

export default CommonButton

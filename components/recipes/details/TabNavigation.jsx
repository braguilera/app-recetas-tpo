import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const TabNavigation = ({ activeTab, onSelectTab }) => {
  const tabs = ["ingredientes", "instrucciones", "calificaciones"];

  return (
    <View className="flex-row justify-center border-b border-gray-200 mb-4">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          className={`py-2 px-4 ${
            activeTab === tab ? "border-b-2 border-amber-400" : ""
          }`}
          onPress={() => onSelectTab(tab)}
        >
          <Text
            className={`font-medium ${
              activeTab === tab ? "text-amber-500" : "text-gray-500"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabNavigation;
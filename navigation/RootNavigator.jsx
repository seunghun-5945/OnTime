import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AddTransportationModal from '../components/transportation/AddTransportationModal';
import AddToDoModal from '../components/todolist/AddToDoModal';
import AddMemoModal from '../components/memo/AddMemoModal';
import AddMemo from '../components/memo/AddMemo';
import SelectCity from '../screens/SelectCity';
import SelectStation from '../screens/SelectStation';
import BusArrival from '../components/transportation/bus/BusArrival';

// 스크린 임포트
import HomeScreen from '../screens/HomeScreen';
import SettingScreen from '../screens/SettingScreen';

// 네비게이터 생성
const RootTab = createBottomTabNavigator();
const RootStack = createStackNavigator();

// 바텀 탭 네비게이터
const BottomTabNavigator = () => {
  return (
    <RootTab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Upload':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Reels':
              iconName = focused ? 'play-circle' : 'play-circle-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <RootTab.Screen
        name="Home"
        component={HomeScreen}
        options={{title: '홈'}}
      />
      <RootTab.Screen
        name="Setting"
        component={SettingScreen}
        options={{title: '설정'}}
      />
    </RootTab.Navigator>
  );
};

// 루트 스택 네비게이터
const RootNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: '#f4f4f4'},
          headerTintColor: '#333',
          headerTitleStyle: {fontWeight: 'bold'},
        }}
        initialRouteName="MainTab">
        {/* 메인 탭 네비게이터 */}
        <RootStack.Screen
          name="MainTab"
          component={BottomTabNavigator}
          options={{headerShown: false}}
        />

        {/* 로그인 화면
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        /> */}

        {/* 게시물 상세 화면 등 추가 가능
        <RootStack.Screen
          name="PostDetail"
          component={PostDetailScreen}
          options={({route}) => ({
            title: `게시물 ${route.params.postId}`,
            headerBackTitle: '뒤로',
            
          })}
        /> */}

        <RootStack.Screen
          name="AddTransportationModal"
          component={AddTransportationModal}
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name="SelectCity"
          component={SelectCity}
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name="SelectStation"
          component={SelectStation}
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name="BusArrival"
          component={BusArrival}
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name="AddToDoModal"
          component={AddToDoModal}
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name="AddMemoModal"
          component={AddMemoModal}
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name="AddMemo"
          component={AddMemo}
          options={{headerShown: false}}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

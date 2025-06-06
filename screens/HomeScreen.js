import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AddItemButton from '../components/AddItemButton';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs'; // 날짜 포맷용 (선택적 설치: yarn add dayjs)
import {Text} from 'react-native';

const SafeArea = styled.SafeAreaView`
  flex: 1;
`;

const Container = styled.ScrollView`
  flex: 1;
  padding: 20px;
`;

const SectionBar = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SectionText = styled.Text`
  font-size: 20px;
`;

const Hr = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: lightgray;
  margin-vertical: 10px;
`;

const TransportationSection = styled.View`
  height: 150px;
  align-items: center;
  justify-content: center;
`;

const WeatherSection = styled.View`
  height: 200px;
  align-items: center;
  justify-content: center;
`;

const TodoSection = styled.View`
  height: 150px;
  align-items: center;
  justify-content: center;
`;

const EditButton = styled.TouchableOpacity`
  padding: 10px;
`;

const HomeScreen = () => {
  const [transportationInfo, setTransportationInfo] = useState('');
  const [weatherTInfo, setWeatherInfo] = useState('');
  const [todoInfo, setTodoInfo] = useState('');
  const [todayTodos, setTodayTodos] = useState([]);
  const navigation = useNavigation();

  // 오늘 날짜 키
  const today = dayjs().format('YYYY-MM-DD');

  // 할 일 불러오기
  const fetchTodos = async () => {
    try {
      const json = await AsyncStorage.getItem('todoList');
      if (json) {
        const todoList = JSON.parse(json);
        setTodayTodos(todoList[today] || []);
      } else {
        setTodayTodos([]);
      }
    } catch (e) {
      console.error('Failed to load todos:', e);
    }
  };

  useEffect(() => {
    // 화면이 포커스 될 때마다 할 일 다시 불러오기
    const unsubscribe = navigation.addListener('focus', fetchTodos);
    // 컴포넌트 언마운트 시 이벤트 제거
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeArea>
      <Container>
        <SectionText>🚏 대중교통 도착 정보</SectionText>
        <TransportationSection>
          <AddItemButton
            onPress={() => {
              console.log('Button pressed'); // 콘솔 로그 추가
              navigation.navigate('AddTransportationModal');
            }}
          />
        </TransportationSection>
        <Hr />
        <SectionText>🌦️ 오늘의 날씨</SectionText>
        <WeatherSection>
          <AddItemButton />
        </WeatherSection>
        <Hr />
        <SectionBar>
          <SectionText>📋 오늘 해야할 일 </SectionText>
          {todayTodos.length > 0 ? (
            <EditButton onPress={() => navigation.navigate('AddToDoModal')}>
              <Text style={{color: 'white', fontSize: 25}}>➕</Text>
            </EditButton>
          ) : (
            <AddItemButton
              onPress={() => navigation.navigate('AddToDoModal')}
            />
          )}
        </SectionBar>

        <TodoSection
          style={{
            alignItems: 'left',
            paddingLeft: 10,
            gap: 10,
          }}>
          {todayTodos.length > 0 ? (
            todayTodos.map((item, idx) => (
              <Text key={idx} style={{fontSize: 16}}>
                ✅ {item}
              </Text>
            ))
          ) : (
            <AddItemButton
              onPress={() => {
                navigation.navigate('AddToDoModal');
              }}
            />
          )}
        </TodoSection>
        <Hr />
        <SectionText>📝 메모</SectionText>
      </Container>
    </SafeArea>
  );
};

export default HomeScreen;

import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AddItemButton from '../components/AddItemButton';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs'; // 날짜 포맷용 (선택적 설치: yarn add dayjs)
import {Text, TouchableOpacity, View} from 'react-native';

const SafeArea = styled.SafeAreaView`
  flex: 1;
`;

const Container = styled.ScrollView`
  flex: 1;
  padding: 20px;
`;

const SectionBar = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
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
  align-items: cemter;
  justify-content: center;
`;

const WeatherSection = styled.View`
  height: 200px;
  align-items: center;
  justify-content: center;
`;

const TodoSection = styled.View`
  height: 200px;
  justify-content: center;
`;

const MemoSection = styled.View`
  min-height: 200px;
  height: 300px;
  align-items: center;
`;

const MemoBox = styled.TouchableOpacity`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
  background-color: #f9f9f9;
  flex-direction: row;
  align-items: center;
`;

const MemoContent = styled.View`
  flex: 1;
`;

const EditButton = styled.TouchableOpacity`
  padding: 10px;
`;

const DeleteButton = styled.TouchableOpacity`
  padding: 10px;
`;

// ✅ 버스 도착 정보 조회 함수
const fetchArrivalInfo = async (cityCode, nodeId, routeId) => {
  try {
    const serviceKey =
      'RKIYsmDDY6qFhbQnqjZ34tezXfFMp8j8lzQdRUGkm6Ydhe%2BsxopdX5kmtMxKeuHr2U%2F0dvbgReF%2B9Dgbm20t1Q%3D%3D';
    const url = `https://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList?serviceKey=${serviceKey}&cityCode=${cityCode}&nodeId=${nodeId}&routeId=${routeId}&_type=json`;
    const res = await fetch(url);
    const json = await res.json();
    const items = json.response?.body?.items?.item;

    if (!items) return null;

    const arrival = Array.isArray(items)
      ? items.find(item => item.routeid === routeId)
      : items?.routeid === routeId
      ? items
      : null;

    return {
      predictTime: arrival?.arrtime || 0,
      remainingStops: arrival?.arrprevstationcnt || 0,
    };
  } catch (e) {
    console.error('🚍 도착 정보 조회 오류:', e);
    return null;
  }
};

const HomeScreen = () => {
  const [transportationInfo, setTransportationInfo] = useState('');
  const [weatherTInfo, setWeatherInfo] = useState('');
  const [todoInfo, setTodoInfo] = useState('');
  const [todayTodos, setTodayTodos] = useState([]);
  const [memoList, setMemoList] = useState([]);
  const [savedBuses, setSavedBuses] = useState([]);

  const navigation = useNavigation();

  // 오늘 날짜 키
  const today = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    console.log('🧾 저장된 버스:', savedBuses);
  }, [savedBuses]);

  // 저장된 버스 가져오기
  const fetchSavedBuses = async () => {
    try {
      const stored = await AsyncStorage.getItem('savedBuses');
      setSavedBuses(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.error('📦 저장된 버스 로드 오류:', e);
    }
  };

  // 정기적으로 도착 정보 갱신
  const refreshSavedBuses = async () => {
    try {
      const stored = await AsyncStorage.getItem('savedBuses');
      const buses = stored ? JSON.parse(stored) : [];

      const updated = await Promise.all(
        buses.map(async bus => {
          const arrival = await fetchArrivalInfo(
            bus.citycode,
            bus.nodeid,
            bus.routeid,
          );

          return {
            ...bus, // stationName 포함됨
            predictTime: arrival?.predictTime ?? 0,
            remainingStops: arrival?.remainingStops ?? 0,
          };
        }),
      );

      setSavedBuses(updated);
      await AsyncStorage.setItem('savedBuses', JSON.stringify(updated));
    } catch (e) {
      console.error('🔄 버스 도착 정보 갱신 실패:', e);
    }
  };

  // 포커스 시 데이터 로드 및 갱신
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSavedBuses();
      refreshSavedBuses();
    });
    return unsubscribe;
  }, [navigation]);

  // 30초마다 자동 갱신 설정
  useEffect(() => {
    const timer = setInterval(refreshSavedBuses, 30000);
    return () => clearInterval(timer);
  }, []);

  // 삭제 기능
  const deleteBus = async routeid => {
    const stored = await AsyncStorage.getItem('savedBuses');
    if (!stored) return;
    const filtered = JSON.parse(stored).filter(b => b.routeid !== routeid);
    await AsyncStorage.setItem('savedBuses', JSON.stringify(filtered));
    setSavedBuses(filtered);
  };

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

  const fetchMemos = async () => {
    try {
      const json = await AsyncStorage.getItem('memoList');
      if (json) {
        const parsed = JSON.parse(json);
        const flattened = Object.values(parsed).flat();
        flattened.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMemoList(flattened);
      } else {
        setMemoList([]);
      }
    } catch (e) {
      console.error('메모 불러오기 실패:', e);
    }
  };

  useEffect(() => {
    const fetchSavedBuses = async () => {
      try {
        const stored = await AsyncStorage.getItem('savedBuses');
        const parsed = stored ? JSON.parse(stored) : [];
        setSavedBuses(parsed);
      } catch (e) {
        console.error('저장된 버스 불러오기 오류:', e);
        setSavedBuses([]);
      }
    };

    // 화면이 포커스될 때마다 실행되도록
    const unsubscribe = navigation.addListener('focus', fetchSavedBuses);

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // 화면이 포커스 될 때마다 할 일 다시 불러오기
    const unsubscribe = navigation.addListener('focus', fetchTodos);
    // 컴포넌트 언마운트 시 이벤트 제거
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchMemos);
    return unsubscribe;
  }, [navigation]);

  const deleteMemo = async idToDelete => {
    try {
      const json = await AsyncStorage.getItem('memoList');
      if (!json) return;

      const parsed = JSON.parse(json); // 날짜별로 저장된 메모
      const updated = Object.fromEntries(
        Object.entries(parsed).map(([date, memos]) => [
          date,
          memos.filter(memo => memo.id !== idToDelete),
        ]),
      );

      await AsyncStorage.setItem('memoList', JSON.stringify(updated));
      fetchMemos(); // UI 업데이트
    } catch (e) {
      console.error('메모 삭제 실패:', e);
    }
  };

  return (
    <SafeArea>
      <Container>
        <SectionBar>
          <SectionText>🚏 대중교통 도착 정보</SectionText>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddTransportationModal')}>
            <Text>➕</Text>
          </TouchableOpacity>
        </SectionBar>

        {savedBuses.length === 0 ? (
          <TransportationSection style={{maxHeight: 200}}>
            <AddItemButton
              onPress={() => navigation.navigate('AddTransportationModal')}
            />
          </TransportationSection>
        ) : (
          <TransportationSection>
            {savedBuses.map(bus => (
              <View
                key={bus.routeid}
                style={{
                  marginBottom: 12,
                  backgroundColor: '#fff',
                  padding: 14,
                  borderRadius: 8,
                  elevation: 1,
                }}>
                <Text style={{fontSize: 18}}>🚌 {bus.routeno}번</Text>
                <Text>정류장: {bus.stationName || '알 수 없음'}</Text>
                <Text>남은 시간: {Math.floor(bus.predictTime / 60)}분</Text>
                <Text>남은 정류장: {bus.remainingStops}개</Text>
                <DeleteButton onPress={() => deleteBus(bus.routeid)}>
                  <Text style={{fontSize: 16, color: '#d32f2f'}}>🗑️ 삭제</Text>
                </DeleteButton>
              </View>
            ))}
          </TransportationSection>
        )}

        <Hr />
        <SectionText>🌦️ 오늘의 날씨</SectionText>
        <WeatherSection>
          <AddItemButton
            onPress={() => navigation.navigate('WeatherForecast')}
          />
        </WeatherSection>
        <Hr />
        {todayTodos.length > 0 ? (
          <>
            <SectionBar>
              <SectionText>📋 오늘 해야할 일</SectionText>
              <EditButton onPress={() => navigation.navigate('AddToDoModal')}>
                <Text style={{color: 'white'}}>➕</Text>
              </EditButton>
            </SectionBar>

            <TodoSection
              style={{alignItems: 'flex-start', paddingLeft: 10, gap: 10}}>
              {todayTodos.map((item, idx) => (
                <Text key={idx} style={{fontSize: 16}}>
                  ✅ {item}
                </Text>
              ))}
            </TodoSection>
          </>
        ) : (
          <>
            <SectionBar>
              <SectionText>📋 오늘 해야할 일</SectionText>
            </SectionBar>
            <TodoSection>
              <AddItemButton
                onPress={() => navigation.navigate('AddToDoModal')}
              />
            </TodoSection>
          </>
        )}

        <Hr />

        <SectionBar>
          <SectionText>📝 메모</SectionText>
          <EditButton onPress={() => navigation.navigate('AddMemo')}>
            <Text>➕</Text>
          </EditButton>
        </SectionBar>

        <MemoSection>
          {memoList.length === 0 ? (
            <AddItemButton onPress={() => navigation.navigate('AddMemo')} />
          ) : (
            memoList.slice(0, 3).map(memo => (
              <MemoBox
                key={memo.id}
                onPress={() => navigation.navigate('AddMemo', {memo})}
                style={{justifyContent: 'space-between'}}>
                <MemoContent>
                  <Text style={{fontWeight: 'bold'}}>
                    {dayjs(memo.createdAt).format('YYYY-MM-DD HH:mm')}
                  </Text>
                  <Text numberOfLines={2}>{memo.content}</Text>
                </MemoContent>
                <DeleteButton onPress={() => deleteMemo(memo.id)}>
                  <Text style={{fontSize: 18, color: 'red'}}>🗑️</Text>
                </DeleteButton>
              </MemoBox>
            ))
          )}
        </MemoSection>
      </Container>
    </SafeArea>
  );
};

export default HomeScreen;

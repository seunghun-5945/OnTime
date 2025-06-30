import {Text, Alert} from 'react-native';
import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // axios 사용

const SafeArea = styled.SafeAreaView`
  flex: 1;
`;

const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 40px;
  gap: 30px;
`;

const DataBtn = styled.TouchableOpacity`
  padding: 20px;
  border-radius: 15px;
  background-color: #ffffff;
  align-items: center;
  justify-content: center;
`;

const DataPage = () => {
  const checkAllData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      console.log('📦 AsyncStorage 전체 데이터:', result);
      Alert.alert('데이터 확인', '콘솔을 확인하세요 (📦 전체 데이터 출력됨)');
    } catch (e) {
      console.error('데이터 확인 실패:', e);
      Alert.alert('오류', '데이터 확인 중 오류 발생');
    }
  };

  const exportData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('인증 오류', '토큰이 없습니다. 로그인 먼저 해주세요.');
        return;
      }
      const keys = ['memoList', 'todoList', 'savedBuses'];
      const items = await AsyncStorage.multiGet(keys);

      const dataMap = Object.fromEntries(
        items.map(([key, value]) => [key, JSON.parse(value)]),
      );

      const {memoList, todoList, savedBuses} = dataMap;

      // 메모 데이터 전송
      if (memoList) {
        for (const date in memoList) {
          const memos = memoList[date];
          for (const memo of memos) {
            await axios.post(
              'http://localhost:8000/notes/',
              {
                content: memo.content, // Swagger 문서 기준: content만 필요
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`, // 인증 토큰 포함
                },
              },
            );
          }
        }
      }

      //  투두 데이터 전송
      if (todoList) {
        for (const date in todoList) {
          const tasks = todoList[date];
          for (const task of tasks) {
            await axios.post(
              'http://localhost:8000/todos/',
              {task, due_date: date},
              {
                headers: {
                  Authorization: `Bearer ${token}`, // ✅ 토큰 추가
                },
              },
            );
          }
        }
      }

      //  버스 데이터 전송
      // if (savedBuses) {
      //   for (const bus of savedBuses) {
      //     await axios.post('https://your-api.com/buses/', bus);
      //   }
      // }

      Alert.alert('✅ 전송 완료', '모든 데이터를 서버로 전송했습니다');
    } catch (e) {
      console.error('데이터 내보내기 오류:', e);
      Alert.alert('❌ 오류', '데이터 내보내기 중 오류 발생');
    }
  };

  const loadDataFromServer = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('인증 오류', '토큰이 없습니다. 로그인 먼저 해주세요.');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // 📌 1. 메모 불러오기
      const notesRes = await axios.get('http://localhost:8000/notes/', {
        headers,
      });
      const notes = notesRes.data;

      const memoList = {};
      notes.forEach(note => {
        const dateKey = note.created_at.split('T')[0];
        if (!memoList[dateKey]) {
          memoList[dateKey] = [];
        }
        memoList[dateKey].push({
          id: note.id.toString(),
          content: note.content,
          createdAt: note.created_at,
        });
      });

      await AsyncStorage.setItem('memoList', JSON.stringify(memoList));

      // 📌 2. 투두 불러오기
      const todosRes = await axios.get('http://localhost:8000/todos/', {
        headers,
      });
      const todos = todosRes.data;

      const todoList = {};
      todos.forEach(todo => {
        const dateKey = todo.due_date.split('T')[0];
        if (!todoList[dateKey]) {
          todoList[dateKey] = [];
        }
        todoList[dateKey].push(todo.task);
      });

      await AsyncStorage.setItem('todoList', JSON.stringify(todoList));

      Alert.alert('✅ 불러오기 성공', '메모와 투두 데이터를 저장했습니다.');
    } catch (error) {
      console.error('📥 데이터 불러오기 오류:', error);
      Alert.alert('❌ 오류', '데이터 불러오기 중 문제가 발생했습니다.');
    }
  };

  return (
    <SafeArea>
      <Container>
        <Text style={{textAlign: 'center'}}>
          저장된 데이터는 앱 삭제시 데이터베이스에 안전하게 {'\n'} 저장되며 앱
          재설치시 데이터 불러오기를 이용하여 복구 가능합니다
        </Text>

        <DataBtn onPress={exportData}>
          <Text>데이터 내보내기</Text>
        </DataBtn>

        <DataBtn onPress={loadDataFromServer}>
          <Text>데이터 불러오기</Text>
        </DataBtn>

        <DataBtn
          onPress={async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              await AsyncStorage.multiRemove(keys);
              Alert.alert('초기화 완료', '모든 데이터가 삭제되었습니다');
            } catch (e) {
              console.error('초기화 실패:', e);
              Alert.alert('오류', '데이터 초기화 중 오류 발생');
            }
          }}>
          <Text>모든데이터 초기화</Text>
        </DataBtn>

        <DataBtn onPress={checkAllData}>
          <Text>데이터 확인 테스트 버튼</Text>
        </DataBtn>
      </Container>
    </SafeArea>
  );
};

export default DataPage;

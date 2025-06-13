import {Text, Alert} from 'react-native';
import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 꼭 import

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

  return (
    <SafeArea>
      <Container>
        <Text style={{textAlign: 'center'}}>
          저장된 데이터는 앱 삭제시 데이터베이스에 안전하게 {'\n'} 저장되며 앱
          재설치시 데이터 불러오기를 이용하여 복구 가능합니다
        </Text>
        <DataBtn>
          <Text>데이터 내보내기</Text>
        </DataBtn>
        <DataBtn>
          <Text>데이터 불러오기</Text>
        </DataBtn>
        <DataBtn>
          <Text>데이터 모든데이터 초기화</Text>
        </DataBtn>
        <DataBtn onPress={checkAllData}>
          <Text>데이터 확인 테스트 버튼</Text>
        </DataBtn>
      </Container>
    </SafeArea>
  );
};

export default DataPage;

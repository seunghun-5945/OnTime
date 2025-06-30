import React, {useState} from 'react';
import {useEffect} from 'react';
import styled from 'styled-components/native';
import {Text, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SafeArea = styled.SafeAreaView`
  flex: 1;
`;

const Container = styled.View`
  flex: 1;
  padding: 20px;
`;

const TopFrame = styled.View`
  flex: 4;
  align-items: center;
  justify-content: center;
`;

const BottomFrame = styled.View`
  flex: 6;
`;

const TitleText = styled.Text`
  font-size: 40px;
`;

const InputBox = styled.TextInput`
  padding: 10px;
  border-bottom-width: 2px;
  border-color: #ccc;
  margin-top: 10px;
`;

const SignInBtn = styled.TouchableOpacity`
  border-radius: 10px;
  padding: 20px;
  background-color: rgb(189, 173, 173);
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const EtcArea = styled.View`
  flex-direction: row;
  padding: 10px;
  justify-content: center;
  align-items: center;
`;

const EtcBtn = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  padding: 10px;
`;

const LogOutArea = styled.View`
  width: 100%;
  align-items: center;
`;

const SignIn = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        console.log('✅ 토큰 존재: 자동 이동');
        navigation.navigate('Home'); // 또는 원하는 화면
      }
    };

    checkToken();
  }, []);

  const handleLogin = async () => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);
    params.append('scope', '');
    params.append('client_id', 'string');
    params.append('client_secret', 'string');

    try {
      const response = await axios.post(
        'http://localhost:8000/auth/login',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const token = response.data.access_token;
      await AsyncStorage.setItem('accessToken', token); // 저장!
      navigation.navigate('Home');
      Alert.alert('로그인 성공', '토큰이 저장되었습니다.');
      setIsLoggedIn(true); // ✅ 상태 업데이트

      // TODO: 로그인 후 화면 이동
    } catch (error) {
      console.error(error);
      Alert.alert('로그인 실패', '아이디 또는 비밀번호를 확인하세요.');
    }
  };

  // ✅ 로그아웃 핸들러
  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    Alert.alert('로그아웃 완료', '다시 로그인해주세요.');
  };

  // ✅ 조건부 렌더링
  if (isLoggedIn) {
    return (
      <SafeArea>
        <Container
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <LogOutArea>
            <Text>이미 로그인되어 있습니다.</Text>
            <SignInBtn onPress={handleLogout}>
              <Text>로그아웃</Text>
            </SignInBtn>
          </LogOutArea>
        </Container>
      </SafeArea>
    );
  }

  return (
    <SafeArea>
      <Container>
        <TopFrame>
          <TitleText>OnTime</TitleText>
          <Text>로그인을 하면 데이터 내보내기가 가능합니다!</Text>
        </TopFrame>
        <BottomFrame>
          <Text>아이디</Text>
          <InputBox
            placeholder="아이디"
            value={username}
            onChangeText={setUsername}
          />
          <Text style={{marginTop: 20}}>비밀번호</Text>
          <InputBox
            placeholder="비밀번호"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <SignInBtn onPress={handleLogin}>
            <Text>로그인</Text>
          </SignInBtn>
          <EtcArea>
            <EtcBtn
              onPress={() => {
                navigation.getParent()?.navigate('SignUp');
              }}>
              <Text>회원가입</Text>
            </EtcBtn>
            <Text>|</Text>
            <EtcBtn>
              <Text>아이디 찾기</Text>
            </EtcBtn>
            <Text>|</Text>
            <EtcBtn>
              <Text>비밀번호 찾기</Text>
            </EtcBtn>
          </EtcArea>
        </BottomFrame>
      </Container>
    </SafeArea>
  );
};

export default SignIn;

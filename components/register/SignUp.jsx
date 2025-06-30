import styled from 'styled-components/native';
import {Text} from 'react-native';
import {useState} from 'react';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';

const SafeArea = styled.SafeAreaView`
  flex: 1;
`;

const Container = styled.View`
  flex: 1;
  padding: 20px;
`;

const TopFrame = styled.View`
  flex: 3;
  align-items: center;
  justify-content: center;
`;

const BottomFrame = styled.View`
  flex: 7;
  gap: 10px;
`;

const TitleText = styled.Text`
  font-size: 40px;
`;

const InputBox = styled.TextInput`
  padding: 10px;
  border-bottom-width: 2px;
  border-color: #ccc;
`;

const SignUpBtn = styled.TouchableOpacity`
  border-radius: 10px;
  padding: 20px;
  background-color: rgb(173, 189, 173);
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const EtcArea = styled.View`
  flex-direction: row;
  padding: 10px;
  justify-content: center;
  gap: 10px;
`;

const EtcBtn = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
`;

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }

    // ✅ 콘솔에 입력값 출력
    console.log('회원가입 요청 데이터:', {
      username: name,
      email: email,
      password: password,
    });

    try {
      const res = await axios.post('http://localhost:8000/auth/register', {
        username: name,
        email: email,
        password: password,
      });

      alert('회원가입 성공!');
      console.log('서버 응답:', res.data);
      navigation.navigate('signin');
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        console.log('에러 응답:', err.response.data);
        alert(`회원가입 실패: ${err.response.data.message || '서버 오류'}`);
      } else {
        alert('서버 연결 실패');
      }
    }
  };

  return (
    <SafeArea>
      <Container>
        <TopFrame>
          <TitleText>Sign Up</TitleText>
          <Text>회원가입하고 데이터를 안전하게 보관하세요!</Text>
        </TopFrame>
        <BottomFrame>
          <Text>아이디</Text>
          <InputBox placeholder="아이디" value={name} onChangeText={setName} />
          <Text>비밀번호</Text>
          <InputBox
            placeholder="비밀번호 입력"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Text>비밀번호 확인</Text>
          <InputBox
            placeholder="비밀번호 재입력"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Text>이메일 주소</Text>
          <InputBox
            placeholder="예) example@email.com"
            value={email}
            onChangeText={setEmail}
          />
          <Text>나이</Text>
          <InputBox
            placeholder="숫자만 입력"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
          <SignUpBtn onPress={handleSignUp}>
            <Text>회원가입</Text>
          </SignUpBtn>
          <EtcArea>
            <EtcBtn
              onPress={() => {
                navigation.navigate('MainTab', {screen: 'SignIn'});
              }}>
              <Text>로그인</Text>
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

export default SignUp;

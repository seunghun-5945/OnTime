import styled from 'styled-components/native';
import {Text} from 'react-native';

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
  gap: 10px;
`;

const EtcBtn = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
`;

const SignIn = () => {
  return (
    <SafeArea>
      <Container>
        <TopFrame>
          <TitleText>OnTime</TitleText>
          <Text>로그인을 하면 데이터 내보내기가 가능합니다!</Text>
        </TopFrame>
        <BottomFrame>
          <Text>이메일 주소</Text>
          <InputBox placeholder="예) tmdgns5945@naver.com" />
          <Text>비밀번호</Text>
          <InputBox placeholder="" ty />
          <SignInBtn>
            <Text>로그인</Text>
          </SignInBtn>
          <EtcArea>
            <EtcBtn>
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

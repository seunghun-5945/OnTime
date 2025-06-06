import React from 'react';
import styled from 'styled-components/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const ModalTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 0 20px;
`;

const TransportationBtn = styled.TouchableOpacity`
  width: 45%;
  height: 250px;
  background-color: white;
  border-radius: 15px;
  align-items: center;
  justify-content: center;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
`;

const BtnText = styled.Text`
  font-size: 18px;
  margin-top: 10px;
  color: #333;
  font-weight: 600;
`;

const AddTransportationModal = () => {
  const navigation = useNavigation();

  return (
    <Container>
      <ModalTitle>교통수단 선택</ModalTitle>
      <ButtonContainer>
        <TransportationBtn onPress={() => navigation.navigate('SelectCity')}>
          <Ionicons name="bus" size={80} color="#2196F3" />
          <BtnText>버스</BtnText>
        </TransportationBtn>
        <TransportationBtn>
          <MaterialIcons name="train" size={80} color="#4CAF50" />
          <BtnText>기차</BtnText>
        </TransportationBtn>
      </ButtonContainer>
    </Container>
  );
};

export default AddTransportationModal;

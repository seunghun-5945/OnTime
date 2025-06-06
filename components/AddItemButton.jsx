import React from 'react';
import styled from 'styled-components/native';
import Octicons from 'react-native-vector-icons/Octicons';

const Container = styled.TouchableOpacity`
  width: 100%;
  height: 80%;
  align-items: center;
  justify-content: center;
  border: 2px dotted gray;
  border-radius: 10px;
  gap: 10px;
`;

const InfoText = styled.Text`
  font-size: 15px;
  color: gray;
`;

const AddItemButton = ({onPress}) => {
  return (
    <Container onPress={onPress}>
      <Octicons name="diff-added" size={40} color="gray" />
      <InfoText>클릭하여 추가하기</InfoText>
    </Container>
  );
};

export default AddItemButton;

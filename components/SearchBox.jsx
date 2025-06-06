import React, {useState} from 'react';
import styled from 'styled-components/native';
import {Text} from 'react-native';

const Container = styled.View`
  width: 100%;
  border-radius: 15px;
  background-color: white;
  border: 2px solid gray;
`;

const TextInputArea = styled.TextInput`
  font-size: 20px;
  padding: 10px;
`;

const SearchBox = ({
  placeholder = '지역을 입력하세요',
  onSearch = () => {},
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleChangeText = text => {
    setInputValue(text);
    onSearch(text);
  };

  return (
    <Container>
      <TextInputArea
        placeholder={placeholder}
        value={inputValue}
        onChangeText={handleChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
    </Container>
  );
};

export default SearchBox;

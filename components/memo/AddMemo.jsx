import React, {useState} from 'react';
import {TextInput, Button, Alert} from 'react-native';
import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import uuid from 'react-native-uuid';

const SafeArea = styled.SafeAreaView`
  flex: 1;
  padding: 20px;
`;

const StyledInput = styled.TextInput`
  border: 1px solid gray;
  padding: 10px;
  height: 200px;
  text-align-vertical: top;
`;

const AddMemo = ({route, navigation}) => {
  const editingMemo = route?.params?.memo || null;
  const editingDate = route?.params?.date || dayjs().format('YYYY-MM-DD');

  const [memo, setMemo] = useState(editingMemo ? editingMemo.content : '');

  const saveMemo = async () => {
    try {
      const json = await AsyncStorage.getItem('memoList');
      const memoList = json ? JSON.parse(json) : {};

      const dateMemos = memoList[editingDate] || [];

      if (editingMemo) {
        // 편집 모드 - id로 찾아 업데이트
        const updatedMemos = dateMemos.map(m =>
          m.id === editingMemo.id ? {...m, content: memo} : m,
        );
        memoList[editingDate] = updatedMemos;
      } else {
        // 새 메모 추가
        const newMemo = {
          id: uuid.v4(),
          content: memo,
          createdAt: new Date().toISOString(),
        };
        memoList[editingDate] = [...dateMemos, newMemo];
      }

      await AsyncStorage.setItem('memoList', JSON.stringify(memoList));
      Alert.alert('저장 완료', '메모가 저장되었습니다.');
      navigation.goBack();
    } catch (e) {
      console.error('메모 저장 실패:', e);
      Alert.alert('오류', '메모 저장에 실패했습니다.');
    }
  };

  return (
    <SafeArea>
      <StyledInput
        multiline
        placeholder="메모를 작성하세요..."
        value={memo}
        onChangeText={setMemo}
      />
      <Button title="저장" onPress={saveMemo} />
    </SafeArea>
  );
};

export default AddMemo;

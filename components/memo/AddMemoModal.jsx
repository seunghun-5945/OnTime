import React, {useEffect, useState} from 'react';
import {Text, Alert} from 'react-native';
import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

const SafeArea = styled.SafeAreaView`
  flex: 1;
`;

const Container = styled.ScrollView`
  padding: 20px;
`;

const TitleSection = styled.View`
  flex-direction: row;
  width: 100%;
  padding: 10px;
  border: 1px solid red;
  align-items: center;
  justify-content: space-between;
`;

const IconButton = styled.TouchableOpacity`
  padding: 5px;
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

const Checkbox = styled.TouchableOpacity`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #666;
  background-color: ${({checked}) => (checked ? '#007aff' : 'transparent')};
  margin-right: 10px;
  justify-content: center;
  align-items: center;
`;

const CheckboxMark = styled.View`
  width: 12px;
  height: 12px;
  background-color: white;
`;

const MemoContent = styled.View`
  flex: 1;
`;

const DeleteButton = styled.TouchableOpacity`
  background-color: red;
  padding: 8px 12px;
  border-radius: 5px;
  margin-left: 10px;
`;

const DeleteButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;

const AddMemoModal = () => {
  const navigation = useNavigation();
  const [memos, setMemos] = useState({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    const fetchMemos = async () => {
      try {
        const json = await AsyncStorage.getItem('memoList');
        if (json) {
          const parsed = JSON.parse(json);
          setMemos(parsed);
        } else {
          setMemos({});
        }
      } catch (e) {
        console.error('메모 불러오기 실패:', e);
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchMemos);
    return unsubscribe;
  }, [navigation]);

  const memoArray = Object.values(memos).flat();
  memoArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const toggleSelect = id => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) {
      Alert.alert('선택 없음', '삭제할 메모를 선택하세요.');
      return;
    }

    Alert.alert(
      '삭제 확인',
      `선택한 ${selectedIds.size}개의 메모를 삭제하시겠습니까?`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            // memos는 {date: [memo, ...]} 구조
            const newMemos = {};
            for (const [date, memoList] of Object.entries(memos)) {
              const filtered = memoList.filter(
                memo => !selectedIds.has(memo.id),
              );
              if (filtered.length > 0) {
                newMemos[date] = filtered;
              }
            }
            try {
              await AsyncStorage.setItem('memoList', JSON.stringify(newMemos));
              setMemos(newMemos);
              setSelectedIds(new Set());
              setDeleteMode(false);
              Alert.alert('삭제 완료', '선택한 메모가 삭제되었습니다.');
            } catch (e) {
              console.error('메모 삭제 실패:', e);
              Alert.alert('오류', '메모 삭제에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeArea>
      <Container>
        <TitleSection>
          <Text>메모 작성하기</Text>

          <IconButton onPress={() => navigation.navigate('AddMemo')}>
            <Text style={{fontSize: 20}}>✚</Text>
          </IconButton>

          <IconButton
            onPress={() => {
              setDeleteMode(!deleteMode);
              setSelectedIds(new Set());
            }}>
            <Text style={{fontSize: 20}}>🗑️</Text>
          </IconButton>

          {deleteMode && (
            <DeleteButton onPress={deleteSelected}>
              <DeleteButtonText>삭제</DeleteButtonText>
            </DeleteButton>
          )}
        </TitleSection>

        {memoArray.length === 0 ? (
          <Text>저장된 메모가 없습니다.</Text>
        ) : (
          memoArray.map(memo => (
            <MemoBox
              key={memo.id}
              onPress={() => {
                if (deleteMode) {
                  toggleSelect(memo.id);
                } else {
                  navigation.navigate('AddMemo', {memo});
                }
              }}>
              {deleteMode && (
                <Checkbox
                  checked={selectedIds.has(memo.id)}
                  onPress={() => toggleSelect(memo.id)}>
                  {selectedIds.has(memo.id) && <CheckboxMark />}
                </Checkbox>
              )}

              <MemoContent>
                <Text style={{fontWeight: 'bold'}}>
                  {dayjs(memo.createdAt).format('YYYY-MM-DD HH:mm')}
                </Text>
                <Text numberOfLines={3}>{memo.content}</Text>
              </MemoContent>
            </MemoBox>
          ))
        )}
      </Container>
    </SafeArea>
  );
};

export default AddMemoModal;

import React, {useState, useEffect} from 'react';
import {
  FlatList,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styled from 'styled-components/native';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const CalendarWrapper = styled.View`
  flex: 1;
`;

const Content = styled.View`
  flex: 1;
  padding: 16px;
`;

const Input = styled.TextInput`
  border-width: 1px;
  border-color: #ccc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const TodoRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: 4px;
`;

const TodoText = styled.Text`
  font-size: 16px;
  flex: 1;
`;

const EditInput = styled.TextInput`
  border-width: 1px;
  border-color: gray;
  padding: 6px;
  border-radius: 4px;
  flex: 1;
`;

const EditButton = styled.TouchableOpacity`
  margin-horizontal: 8px;
`;

const DeleteButton = styled.TouchableOpacity``;

const TodoListWrapper = styled.FlatList`
  margin-top: 12px;
  padding: 8px;
  border-radius: 8px;
`;

const AddToDoModal = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [todoText, setTodoText] = useState('');
  const [todoList, setTodoList] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const json = await AsyncStorage.getItem('todoList');
        if (json) {
          setTodoList(JSON.parse(json));
        }
      } catch (e) {
        console.error('Failed to load todoList', e);
      }
    };
    loadTodos();
  }, []);

  const saveTodoList = async updated => {
    try {
      await AsyncStorage.setItem('todoList', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save todoList', e);
    }
  };

  const handleAddTodo = async () => {
    if (!selectedDate || !todoText) return;

    const updated = {...todoList};
    if (!updated[selectedDate]) updated[selectedDate] = [];
    updated[selectedDate].push(todoText);
    setTodoList(updated);
    await saveTodoList(updated);

    setTodoText('');
  };

  const handleDeleteTodo = async index => {
    const updated = {...todoList};
    if (!updated[selectedDate]) return;

    updated[selectedDate].splice(index, 1);
    setTodoList(updated);
    await saveTodoList(updated);
  };

  const startEditing = (index, text) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const saveEditing = async () => {
    if (editingIndex === null || editingText.trim() === '') return;

    const updated = {...todoList};
    updated[selectedDate][editingIndex] = editingText.trim();

    setTodoList(updated);
    await saveTodoList(updated);

    setEditingIndex(null);
    setEditingText('');
  };

  const markedDates = {};
  Object.keys(todoList).forEach(date => {
    markedDates[date] = {
      marked: true,
      dotColor: 'purple',
      selected: date === selectedDate,
      selectedColor: '#d8b4fe',
    };
  });

  return (
    <Container>
      <CalendarWrapper>
        <Calendar
          onDayPress={day => setSelectedDate(day.dateString)}
          markedDates={markedDates}
        />
      </CalendarWrapper>

      <Content>
        <Input
          placeholder="할 일을 입력하세요"
          value={todoText}
          onChangeText={setTodoText}
        />
        <Button title="추가하기" onPress={handleAddTodo} />

        {selectedDate && todoList[selectedDate]?.length > 0 && (
          <TodoListWrapper
            data={todoList[selectedDate]}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({item, index}) => (
              <TodoRow>
                {editingIndex === index ? (
                  <>
                    <EditInput
                      value={editingText}
                      onChangeText={setEditingText}
                      autoFocus
                    />
                    <Button title="저장" onPress={saveEditing} />
                    <Button
                      title="취소"
                      onPress={() => setEditingIndex(null)}
                      color="gray"
                    />
                  </>
                ) : (
                  <>
                    <TodoText>• {item}</TodoText>
                    <EditButton onPress={() => startEditing(index, item)}>
                      <Text>수정</Text>
                    </EditButton>
                    <DeleteButton onPress={() => handleDeleteTodo(index)}>
                      <Text style={{color: 'red'}}>삭제</Text>
                    </DeleteButton>
                  </>
                )}
              </TodoRow>
            )}
          />
        )}
      </Content>
    </Container>
  );
};

export default AddToDoModal;

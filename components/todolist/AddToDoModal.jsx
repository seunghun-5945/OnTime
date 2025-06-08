import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddToDoModal = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [todoText, setTodoText] = useState('');
  const [todoList, setTodoList] = useState({});

  // 편집 중인 아이템 인덱스와 텍스트 상태 추가
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

  // 저장 함수 공통화
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

  // Todo 삭제
  const handleDeleteTodo = async index => {
    const updated = {...todoList};
    if (!updated[selectedDate]) return;

    updated[selectedDate].splice(index, 1);
    setTodoList(updated);
    await saveTodoList(updated);

    // 만약 삭제 후 리스트가 비면 selectedDate 초기화 가능 (선택사항)
    // if (updated[selectedDate].length === 0) setSelectedDate('');
  };

  // Todo 편집 시작
  const startEditing = (index, text) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  // 편집 내용 저장
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
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{flex: 1}}>
        <Calendar
          onDayPress={day => setSelectedDate(day.dateString)}
          markedDates={markedDates}
        />
      </View>

      <View style={{flex: 1, padding: 16}}>
        <TextInput
          placeholder="할 일을 입력하세요"
          value={todoText}
          onChangeText={setTodoText}
          style={styles.input}
        />
        <Button title="추가하기" onPress={handleAddTodo} />

        {selectedDate && todoList[selectedDate]?.length > 0 && (
          <FlatList
            data={todoList[selectedDate]}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({item, index}) => (
              <View style={styles.todoRow}>
                {editingIndex === index ? (
                  <>
                    <TextInput
                      style={[styles.todoItem, styles.editInput]}
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
                    <Text style={styles.todoItem}>• {item}</Text>
                    <TouchableOpacity
                      onPress={() => startEditing(index, item)}
                      style={styles.editButton}>
                      <Text style={{color: 'blue'}}>수정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteTodo(index)}
                      style={styles.deleteButton}>
                      <Text style={{color: 'red'}}>삭제</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
            style={{
              marginTop: 12,
              borderWidth: 1,
              borderColor: 'red',
              padding: 8,
              borderRadius: 8,
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  todoItem: {
    fontSize: 16,
    flex: 1,
  },
  editInput: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 6,
    borderRadius: 4,
  },
  editButton: {
    marginHorizontal: 8,
  },
  deleteButton: {},
});

export default AddToDoModal;

import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import axios from 'axios';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import SearchBox from '../components/SearchBox';
import {useNavigation} from '@react-navigation/native';

const Container = styled.SafeAreaView`
  flex: 1;
`;

const CitySelectBox = styled.View`
  padding: 20px;
  align-items: center;
`;

const CityBox = styled.TouchableOpacity`
  width: 100%;
  padding: 15px;
  background-color: #ffffff;
  margin-bottom: 10px;
  border-radius: 8px;
`;

// 공통 서비스 키
const serviceKey =
  'RKIYsmDDY6qFhbQnqjZ34tezXfFMp8j8lzQdRUGkm6Ydhe+sxopdX5kmtMxKeuHr2U/0dvbgReF+9Dgbm20t1Q==';

const SelectCity = () => {
  const [cityData, setCityData] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stationData, setStationData] = useState(null);
  const [arrivalData, setArrivalData] = useState(null);
  const [searchText, setSearchText] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    // 앱 시작시 도시코드 목록부터 조회
    fetchCityCodeList();
  }, []);

  // 오류 처리 함수
  const handleError = (error, operation) => {
    console.error(`${operation} 오류:`, error);
    setError(`${operation} 중 오류가 발생했습니다. 다시 시도해주세요.`);
  };

  // 검색 처리 함수
  const handleSearch = text => {
    setSearchText(text);
  };

  // 1. 도시코드 목록 조회 함수
  const fetchCityCodeList = async () => {
    setLoading(true);
    setError(null);
    setSelectedCity(null);
    setStationData(null);
    setArrivalData(null);

    try {
      const response = await axios.request({
        method: 'get',
        url: 'https://apis.data.go.kr/1613000/ArvlInfoInqireService/getCtyCodeList',
        params: {
          serviceKey: serviceKey,
          _type: 'json',
        },
      });

      console.log('도시코드 목록:', response.data);
      setCityData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('도시코드 목록 조회 오류:', error);
      handleError(error, '도시코드 조회');
      setLoading(false);
    }
  };

  // 로딩 상태 표시
  if (loading) {
    return (
      <Container>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{marginTop: 10}}>도시 정보를 불러오는 중...</Text>
        </View>
      </Container>
    );
  }

  // 오류 상태 표시
  if (error) {
    return (
      <Container>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: 'red'}}>{error}</Text>
          <TouchableOpacity
            style={{
              marginTop: 20,
              padding: 10,
              backgroundColor: '#ddd',
              borderRadius: 5,
            }}
            onPress={fetchCityCodeList}>
            <Text>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  // 1. 도시 선택 화면
  if (cityData && cityData.response?.body?.items?.item) {
    const cities = cityData.response.body.items.item || [];

    // 검색어로 도시 필터링
    const filteredCities =
      searchText.trim() === ''
        ? cities
        : cities.filter(city =>
            city.cityname.toLowerCase().includes(searchText.toLowerCase()),
          );

    return (
      <Container>
        <ScrollView>
          <View style={{padding: 20, alignItems: 'center'}}>
            <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 10}}>
              도시 선택
            </Text>
            <Text style={{marginBottom: 20}}>
              버스 정보를 조회할 도시를 선택하세요
            </Text>
            <SearchBox
              placeholder="도시명을 입력하세요"
              onSearch={handleSearch}
            />
          </View>

          <CitySelectBox style={{padding: 15}}>
            {filteredCities.length > 0 ? (
              filteredCities.map(city => (
                <CityBox
                  key={city.citycode}
                  onPress={() => {
                    navigation.navigate('SelectStation', {
                      cityCode: city.citycode,
                      cityName: city.cityname,
                    });
                  }}>
                  <Text style={{fontSize: 18}}>{city.cityname}</Text>
                </CityBox>
              ))
            ) : (
              <View style={{alignItems: 'center', padding: 20}}>
                <Text style={{textAlign: 'center'}}>검색 결과가 없습니다.</Text>
              </View>
            )}
          </CitySelectBox>
        </ScrollView>
      </Container>
    );
  }

  // 데이터가 없거나 응답이 비정상적인 경우
  return (
    <Container>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{marginTop: 10}}>데이터를 불러오는 중입니다...</Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: '#ddd',
            borderRadius: 5,
          }}
          onPress={fetchCityCodeList}>
          <Text>다시 시도</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
};

export default SelectCity;

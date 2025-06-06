import React, {useState, useEffect, useRef, useCallback} from 'react';
import styled from 'styled-components/native';
import SearchBox from '../components/SearchBox';
import axios from 'axios';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

const Container = styled.SafeAreaView`
  flex: 1;
`;

const ExplainArea = styled.View`
  width: 100%;
  padding: 20px;
  background-color: #4bb2e6;
  border-radius: 15px;
  margin-top: 30px;
`;

const StationBox = styled.TouchableOpacity`
  width: 100%;
  padding: 15px;
  background-color: white;
  margin-bottom: 10px;
  border-radius: 8px;
`;

const StationName = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const StationAddress = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 5px;
`;

const NoResultText = styled.Text`
  text-align: center;
  padding: 20px;
`;

const ResultTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  width: 100%;
`;

// 캐시를 저장할 객체
const searchCache = {};

// 노선 정보 캐시를 위한 객체 추가
const routeCache = {};

// 공통 서비스 키
const serviceKey =
  'RKIYsmDDY6qFhbQnqjZ34tezXfFMp8j8lzQdRUGkm6Ydhe+sxopdX5kmtMxKeuHr2U/0dvbgReF+9Dgbm20t1Q==';

const SelectStation = ({route, navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [stationData, setStationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false); // 타이핑 중인지 상태 추가
  // 경유 노선 정보를 담을 상태 추가
  const [stationRoutes, setStationRoutes] = useState({});
  // 노선 정보 로딩 상태
  const [routesLoading, setRoutesLoading] = useState(false);

  // 디바운스를 위한 타이머 ref
  const debounceTimer = useRef(null);

  // route.params에서 cityCode, cityName을 받아옴
  const {cityCode, cityName} = route.params || {
    cityCode: null,
    cityName: '선택된 도시 없음',
  };

  useEffect(() => {
    // 네비게이션 헤더 제목 설정
    if (navigation) {
      navigation.setOptions({
        title: `${cityName} 정류장 검색`,
      });
    }
  }, [navigation, cityName]);

  // 디바운스 처리된 검색 함수
  const debouncedSearch = useCallback(
    text => {
      // 이전 타이머가 있으면 취소
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      setIsTyping(true); // 타이핑 중임을 표시

      // 새 타이머 설정 (300ms)
      debounceTimer.current = setTimeout(() => {
        setIsTyping(false); // 타이핑 끝남
        if (text.trim().length >= 2) {
          fetchStationInfo(text);
        } else {
          setStationData(null);
        }
      }, 300);
    },
    [cityCode],
  );

  // 검색 핸들러
  const handleSearch = text => {
    setSearchText(text);
    debouncedSearch(text);
  };

  // API 요청 캔슬 토큰
  const cancelTokenSource = useRef(null);

  // fetchStationInfo 함수 수정
  const fetchStationInfo = async stationName => {
    if (!cityCode) {
      setError('도시가 선택되지 않았습니다. 도시 선택 화면으로 돌아가세요.');
      return;
    }

    // 캐시 키 생성
    const cacheKey = `${cityCode}_${stationName}`;

    // 캐시에 있는지 확인
    if (searchCache[cacheKey]) {
      console.log('캐시에서 정류소 정보 로드:', cacheKey);
      setStationData(searchCache[cacheKey]);
      // 캐시에서 정보를 가져온 후에도 노선 정보 로드
      loadRouteInfoForStations(searchCache[cacheKey]);
      return;
    }

    // 이전 요청 취소 및 새 토큰 생성 (기존 코드 유지)
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('새로운 검색 요청이 발생했습니다.');
    }
    cancelTokenSource.current = axios.CancelToken.source();

    setLoading(true);
    setError(null);

    try {
      const response = await axios.request({
        method: 'get',
        url: 'https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getSttnNoList',
        params: {
          serviceKey: serviceKey,
          cityCode: cityCode,
          nodeNm: stationName,
          numOfRows: '20',
          pageNo: '1',
          _type: 'json',
        },
        cancelToken: cancelTokenSource.current.token,
        timeout: 5000,
      });

      console.log('정류소 정보:', response.data);

      // 응답 데이터 캐싱
      searchCache[cacheKey] = response.data;

      setStationData(response.data);

      // 여기에 노선 정보 로드 함수 호출 추가
      loadRouteInfoForStations(response.data);
    } catch (error) {
      // 오류 처리 (기존 코드 유지)
      if (axios.isCancel(error)) {
        console.log('요청 취소됨:', error.message);
      } else {
        console.error('정류소 정보 조회 오류:', error);
        setError('정류소 정보 조회 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 노선 정보 로드 함수에 디버깅 로그 추가
  const loadRouteInfoForStations = async stationData => {
    if (!stationData?.response?.body?.items?.item) {
      console.log('loadRouteInfoForStations: 정류장 데이터 없음');
      return;
    }

    const stations = stationData.response.body.items.item || [];
    const stationList = Array.isArray(stations) ? stations : [stations];

    if (stationList.length === 0) {
      console.log('loadRouteInfoForStations: 정류장 목록이 비어있음');
      return;
    }

    console.log(
      `loadRouteInfoForStations: ${stationList.length}개 정류장 처리 시작`,
    );
    setRoutesLoading(true);

    // 모든 정류장의 노선 정보를 담을 객체
    const routesInfo = {};

    // 각 정류장별로 노선 정보 로드
    for (const station of stationList) {
      if (station.nodeid) {
        console.log(
          `${station.nodenm} 정류장(${station.nodeid})의 노선 정보 로드 중...`,
        );
        const routes = await fetchStationRouteInfo(cityCode, station.nodeid);
        console.log(
          `${station.nodenm} 정류장: ${routes.length}개 노선 정보 로드 완료`,
        );
        routesInfo[station.nodeid] = routes;
      }
    }

    console.log('모든 정류장 노선 정보 로드 완료:', routesInfo);
    setStationRoutes(routesInfo);
    setRoutesLoading(false);
  };

  // fetchStationRouteInfo 함수에도 디버깅 로그 추가
  const fetchStationRouteInfo = async (cityCode, nodeId) => {
    // 캐시 확인
    const cacheKey = `route_${cityCode}_${nodeId}`;
    if (routeCache[cacheKey]) {
      console.log(`캐시에서 노선 정보 로드: ${cacheKey}`);
      return routeCache[cacheKey];
    }

    console.log(`API에서 노선 정보 요청: nodeId=${nodeId}`);
    try {
      const response = await axios.request({
        method: 'get',
        url: 'https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getSttnThrghRouteList',
        params: {
          serviceKey: serviceKey,
          cityCode: cityCode,
          nodeid: nodeId,
          numOfRows: '10',
          pageNo: '1',
          _type: 'json',
        },
        timeout: 5000,
      });

      console.log(`노선 정보 응답 데이터:`, response.data);

      if (response.data.response?.header?.resultCode !== '00') {
        console.error('노선 정보 API 오류:', response.data.response?.header);
        return [];
      }

      const items = response.data.response?.body?.items?.item || [];
      const routeItems = Array.isArray(items) ? items : [items];

      console.log(
        `정류장 ${nodeId}에 대한 노선 ${routeItems.length}개 로드 완료`,
      );

      // 응답 결과 캐싱
      routeCache[cacheKey] = routeItems;

      return routeItems;
    } catch (error) {
      console.error(`정류장 ${nodeId}의 노선 정보 조회 오류:`, error);
      if (error.response) {
        console.error('응답 데이터:', error.response.data);
        console.error('응답 상태:', error.response.status);
      }
      return [];
    }
  };

  // 수정: 각 정류장의 방면 정보를 표시하는 함수
  const renderDirectionInfo = station => {
    const routes = stationRoutes[station.nodeid] || [];

    if (routes.length === 0) {
      if (routesLoading) {
        return (
          <Text style={{fontSize: 12, color: '#999', marginTop: 5}}>
            방면 정보 로딩 중...
          </Text>
        );
      }
      return (
        <Text style={{fontSize: 12, color: '#999', marginTop: 5}}>
          방면 정보 없음
        </Text>
      );
    }

    // 최대 2개 노선만 표시
    const displayedRoutes = routes.slice(0, 2);
    const remainingCount = routes.length > 2 ? routes.length - 2 : 0;

    return (
      <View style={{marginTop: 5}}>
        {displayedRoutes.map((route, index) => (
          <Text
            key={index}
            style={{fontSize: 12, color: '#0064ff', marginTop: 2}}>
            {route.routeno}번: {route.startnodenm} → {route.endnodenm}
          </Text>
        ))}
        {remainingCount > 0 && (
          <Text style={{fontSize: 12, color: '#666', marginTop: 2}}>
            외 {remainingCount}개 노선
          </Text>
        )}
      </View>
    );
  };

  const handleStationSelect = station => {
    if (navigation) {
      navigation.navigate('BusArrival', {
        cityCode: cityCode,
        cityName: cityName,
        nodeId: station.nodeid,
        nodeName: station.nodenm,
      });
    }
  };

  // 검색 결과를 처리하는 함수
  const renderSearchResults = () => {
    if (!stationData?.response?.body?.items?.item) {
      return <NoResultText>검색 결과가 없습니다.</NoResultText>;
    }

    const stations = stationData.response.body.items.item || [];
    const stationList = Array.isArray(stations) ? stations : [stations];

    if (stationList.length === 0) {
      return <NoResultText>검색 결과가 없습니다.</NoResultText>;
    }

    return stationList.map((station, index) => (
      <StationBox
        key={station.nodeid || `station-${index}`}
        onPress={() => handleStationSelect(station)}>
        <StationName>{station.nodenm || '이름 없음'}</StationName>
        <StationAddress>
          {station.nodeno ? `정류소 번호: ${station.nodeno}` : ''}
        </StationAddress>

        {/* 방면 정보 추가 */}
        {renderDirectionInfo(station)}
      </StationBox>
    ));
  };

  return (
    <Container>
      <ScrollView>
        <View style={{padding: 20, alignItems: 'center'}}>
          <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 10}}>
            정류장 선택
          </Text>
          <Text style={{marginBottom: 20}}>
            검색할 정류장 이름을 입력하세요
          </Text>
          <SearchBox
            placeholder="정류장명을 입력하세요"
            onSearch={handleSearch}
          />
          <ExplainArea>
            <Text style={{color: 'white'}}>
              정류소 이름의 일부만 입력해도 검색됩니다.{'\n'}
              예시: '와석', '화명동', '북구청' 등
            </Text>
          </ExplainArea>

          <View style={{width: '100%', marginTop: 20}}>
            {/* 타이핑 중일 때 표시 */}
            {isTyping && (
              <Text style={{textAlign: 'center', marginBottom: 10}}>
                검색 중...
              </Text>
            )}

            {/* 로딩 중일 때 표시 */}
            {loading && (
              <View style={{padding: 10, alignItems: 'center'}}>
                <ActivityIndicator size="small" color="#0064ff" />
                <Text style={{marginTop: 5}}>정류장 정보를 불러오는 중...</Text>
              </View>
            )}

            {/* 에러 메시지 */}
            {error && (
              <View style={{padding: 10}}>
                <Text style={{color: 'red'}}>{error}</Text>
              </View>
            )}

            {/* 검색 결과 표시 */}
            {!isTyping && !loading && stationData && (
              <View
                style={{
                  width: '100%',
                  backgroundColor: '#f0f0f0',
                  padding: 10,
                  borderRadius: 8,
                }}>
                <ResultTitle>검색 결과</ResultTitle>
                {renderSearchResults()}
              </View>
            )}

            {/* 검색어 입력 안내 */}
            {!isTyping &&
              !loading &&
              !stationData &&
              searchText.trim().length >= 2 && (
                <View style={{padding: 10, alignItems: 'center'}}>
                  <Text>정류장을 검색해주세요</Text>
                </View>
              )}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

export default SelectStation;

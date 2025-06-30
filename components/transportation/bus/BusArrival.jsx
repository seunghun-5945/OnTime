import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 서비스 키 (실제로는 환경변수나 설정 파일에서 관리하세요)
const serviceKey =
  'RKIYsmDDY6qFhbQnqjZ34tezXfFMp8j8lzQdRUGkm6Ydhe%2BsxopdX5kmtMxKeuHr2U%2F0dvbgReF%2B9Dgbm20t1Q%3D%3D';

const BusArrival = ({route}) => {
  const [busData, setBusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  // 이전 화면에서 전달받은 데이터
  const {cityCode, cityName, nodeId, nodeName} = route.params || {};

  // 🔍 받은 데이터 콘솔 출력
  useEffect(() => {
    console.log('🔍 === 이전 화면에서 받은 데이터 ===');
    console.log('전체 route.params:', route.params);
    console.log('cityCode:', cityCode);
    console.log('cityName:', cityName);
    console.log('nodeId:', nodeId);
    console.log('nodeName:', nodeName);
    console.log('================================');
  }, [route.params, cityCode, cityName, nodeId, nodeName]);

  useEffect(() => {
    // 네비게이션 헤더 제목 설정
    if (navigation && nodeName) {
      navigation.setOptions({
        title: `${nodeName} 버스 도착 정보`,
      });
    }
  }, [navigation, nodeName]);

  // 정류장 경유 노선 정보 조회
  const fetchStationRoutes = async () => {
    try {
      const apiUrl = `https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getSttnThrghRouteList?serviceKey=${serviceKey}&cityCode=${cityCode}&nodeid=${nodeId}&numOfRows=50&pageNo=1&_type=json`;

      // console.log('🌐 노선 정보 API 호출 URL:', apiUrl);

      const response = await fetch(apiUrl);

      console.log('📡 응답 상태:', response.status, response.statusText);

      // 응답 텍스트를 먼저 확인
      const responseText = await response.text();
      // console.log('📄 응답 내용 (처음 200자):', responseText.substring(0, 200));

      // JSON 파싱 시도
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // console.error('❌ JSON 파싱 실패:', parseError);
        // console.log('전체 응답 텍스트:', responseText);
        throw new Error('API 응답이 올바른 JSON 형식이 아닙니다');
      }

      // console.log('✅ 파싱된 데이터:', JSON.stringify(data, null, 2));

      if (data.response?.header?.resultCode !== '00') {
        // console.log('❌ API 결과 코드:', data.response?.header?.resultCode);
        // console.log('❌ API 결과 메시지:', data.response?.header?.resultMsg);
        throw new Error(
          `노선 정보 조회 실패: ${data.response?.header?.resultMsg}`,
        );
      }

      const items = data.response?.body?.items?.item || [];
      const routes = Array.isArray(items) ? items : [items];

      // console.log('🚌 조회된 노선 수:', routes.length);
      // console.log(
      //   '🚌 노선 목록:',
      //   routes.map(r => ({routeid: r.routeid, routeno: r.routeno})),
      // );

      return routes;
    } catch (err) {
      console.error('❌ 노선 정보 조회 오류:', err);
      return [];
    }
  };

  // 버스 도착 정보 조회 (전국 API 사용)
  const fetchArrivalInfo = async (routeId, routeNo) => {
    try {
      const apiUrl = `https://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList?serviceKey=${serviceKey}&cityCode=${cityCode}&nodeId=${nodeId}&routeId=${routeId}&numOfRows=5&pageNo=1&_type=json`;

      console.log(`🚌 [${routeNo}번] 도착 정보 API 호출 URL:`, apiUrl);
      console.log(
        `🚌 [${routeNo}번] 파라미터: cityCode=${cityCode}, nodeId=${nodeId}, routeId=${routeId}`,
      );

      const response = await fetch(apiUrl);

      console.log(
        `📡 [${routeNo}번] 도착 정보 응답 상태:`,
        response.status,
        response.statusText,
      );

      const responseText = await response.text();
      console.log(
        `📄 [${routeNo}번] 도착 정보 응답 내용 (처음 200자):`,
        responseText.substring(0, 200),
      );

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ [${routeNo}번] JSON 파싱 실패:`, parseError);
        return null;
      }

      console.log(
        `✅ [${routeNo}번] 도착 정보 전체 응답:`,
        JSON.stringify(data, null, 2),
      );

      if (data.response?.header?.resultCode !== '00') {
        console.log(
          `❌ [${routeNo}번] 도착 정보 API 결과 코드:`,
          data.response?.header?.resultCode,
        );
        console.log(
          `❌ [${routeNo}번] 도착 정보 API 결과 메시지:`,
          data.response?.header?.resultMsg,
        );

        // 결과 코드가 03 (데이터 없음)인 경우 null 반환
        if (data.response?.header?.resultCode === '03') {
          console.log(`ℹ️ [${routeNo}번] 도착 정보 없음 (정상)`);
          return null;
        }

        return null;
      }

      const items = data.response?.body?.items?.item || [];
      const arrivalItems = Array.isArray(items) ? items : items ? [items] : [];

      console.log(`🚌 [${routeNo}번] 도착 정보 개수:`, arrivalItems.length);

      if (arrivalItems.length > 0) {
        console.log(
          `🚌 [${routeNo}번] 도착 정보 상세:`,
          arrivalItems.map(item => ({
            arrtime: item.arrtime,
            arrprevstationcnt: item.arrprevstationcnt,
            vehicletp: item.vehicletp,
            routeno: item.routeno,
          })),
        );
      }

      return arrivalItems.length > 0 ? arrivalItems : null;
    } catch (err) {
      console.error(`❌ [${routeNo}번] 도착 정보 조회 오류:`, err);
      console.error(`❌ [${routeNo}번] 에러 상세:`, err.message);
      return null;
    }
  };

  const handleAddBusToHome = async busInfo => {
    Alert.alert('노선 추가', '해당 노선을 메인에 추가하시겠습니까?', [
      {
        text: '아니요',
        style: 'cancel',
      },
      {
        text: '예',
        onPress: async () => {
          try {
            const existing = await AsyncStorage.getItem('savedBuses');
            const parsed = existing ? JSON.parse(existing) : [];

            const alreadyExists = parsed.some(
              item => item.routeid === busInfo.routeid,
            );
            if (!alreadyExists) {
              // 첫 번째 도착 정보만 저장
              const arrival = busInfo.arrivalInfo?.[0];

              const busToSave = {
                routeid: busInfo.routeid,
                routeno: busInfo.routeno,
                stationName: nodeName || '정류장',
                predictTime: arrival?.arrtime || 0,
                remainingStops: arrival?.arrprevstationcnt || 0,
                citycode: cityCode, // ✅ 추가
                nodeid: nodeId, // ✅ 추가
              };

              const updated = [...parsed, busToSave];
              await AsyncStorage.setItem('savedBuses', JSON.stringify(updated));
              Alert.alert('추가 완료', '홈에 노선이 추가되었습니다.');
            } else {
              Alert.alert('이미 추가됨', '해당 노선은 이미 등록되어 있습니다.');
            }
          } catch (e) {
            console.error('노선 저장 실패:', e);
          }
        },
      },
    ]);
  };

  // 전체 버스 정보 로드
  const loadBusData = async () => {
    try {
      setError(null);
      console.log('🔄 === 버스 정보 로드 시작 ===');

      // 1. 먼저 이 정류장을 경유하는 노선들을 조회
      const routes = await fetchStationRoutes();

      if (routes.length === 0) {
        console.log('ℹ️ 경유하는 노선이 없습니다.');
        setBusData([]);
        return;
      }

      console.log('🚌 총 노선 수:', routes.length);

      // 2. 각 노선별로 도착 정보 조회 (순차적으로 처리하여 로그 확인)
      const busInfoList = [];

      for (const route of routes) {
        console.log(`\n🔍 === ${route.routeno}번 버스 처리 시작 ===`);
        console.log(`노선 정보:`, {
          routeid: route.routeid,
          routeno: route.routeno,
          startnodenm: route.startnodenm,
          endnodenm: route.endnodenm,
          routetp: route.routetp,
        });

        const arrivalInfo = await fetchArrivalInfo(
          route.routeid,
          route.routeno,
        );

        const filteredArrival = arrivalInfo
          ? arrivalInfo
              .filter(info => info.routeid === route.routeid)
              .slice(0, 2)
          : null;

        const busInfo = {
          ...route,
          arrivalInfo: filteredArrival,
          hasArrivalInfo:
            filteredArrival !== null && filteredArrival.length > 0,
        };

        console.log(`✅ ${route.routeno}번 버스 최종 정보:`, {
          routeno: route.routeno,
          hasArrivalInfo: busInfo.hasArrivalInfo,
          arrivalCount: arrivalInfo ? arrivalInfo.length : 0,
        });

        busInfoList.push(busInfo);
        console.log(`=== ${route.routeno}번 버스 처리 완료 ===\n`);
      }

      console.log('🔄 === 모든 버스 정보 로드 완료 ===');
      console.log('최종 버스 데이터 개수:', busInfoList.length);

      setBusData(busInfoList);
    } catch (err) {
      console.error('❌ 버스 정보 로드 오류:', err);
      setError('버스 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 초기 로드
  useEffect(() => {
    if (cityCode && nodeId) {
      console.log('📍 API 호출 시작 - cityCode:', cityCode, 'nodeId:', nodeId);
      setLoading(true);
      loadBusData().finally(() => setLoading(false));
    } else {
      console.log(
        '❌ 필수 데이터 누락 - cityCode:',
        cityCode,
        'nodeId:',
        nodeId,
      );
      setError('정류장 정보가 없습니다.');
      setLoading(false);
    }
  }, [cityCode, nodeId]);

  // 새로고침
  const onRefresh = async () => {
    console.log('🔄 새로고침 시작');
    setRefreshing(true);
    await loadBusData();
    setRefreshing(false);
    console.log('🔄 새로고침 완료');
  };

  // 도착 정보 렌더링
  const renderArrivalInfo = (arrivalInfo, routeNo) => {
    console.log(`🎨 [${routeNo}번] 도착 정보 렌더링:`, arrivalInfo);

    if (!arrivalInfo || arrivalInfo.length === 0) {
      return <Text style={styles.noArrival}>도착 정보 없음</Text>;
    }

    return arrivalInfo.slice(0, 1).map((info, index) => (
      <View key={`${routeNo}-${index}`} style={styles.arrivalItem}>
        <Text style={styles.arrivalText}>
          🚌{' '}
          {info.arrtime && info.arrtime !== '0'
            ? `${Math.floor(info.arrtime / 60)}분 후 도착`
            : info.arrprevstationcnt && info.arrprevstationcnt !== '0'
            ? `${info.arrprevstationcnt}개 정류장 전`
            : '곧 도착'}
        </Text>
        {info.arrprevstationcnt && info.arrprevstationcnt !== '0' && (
          <Text style={styles.locationText}>
            {info.arrprevstationcnt}번째 전 정류장
          </Text>
        )}
        {info.vehicletp === '1' && (
          <Text style={styles.lowBusText}>♿ 저상버스</Text>
        )}
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0064ff" />
        <Text style={styles.loadingText}>버스 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            loadBusData().finally(() => setLoading(false));
          }}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.header}>
          <Text style={styles.stationName}>{nodeName}</Text>
          <Text style={styles.stationInfo}>{cityName}</Text>
        </View>

        <Text style={styles.title}>🚌 실시간 버스 도착 정보</Text>

        {busData.length === 0 ? (
          <View style={styles.noBusContainer}>
            <Text style={styles.noBusText}>운행 중인 버스가 없습니다.</Text>
          </View>
        ) : (
          busData.map((bus, idx) => (
            <TouchableOpacity
              key={`bus-${bus.routeid}-${idx}`}
              style={styles.busItem}
              onPress={() => handleAddBusToHome(bus)} // ⬅ bus로 수정
            >
              <View style={styles.busHeader}>
                <Text style={styles.busNumber}>{bus.routeno}번</Text>
                <Text style={styles.busType}>
                  {bus.routetp === '1'
                    ? '간선'
                    : bus.routetp === '2'
                    ? '지선'
                    : bus.routetp === '3'
                    ? '순환'
                    : '일반'}
                </Text>
              </View>

              <Text style={styles.routeInfo}>
                {bus.startnodenm} → {bus.endnodenm}
              </Text>

              <View style={styles.arrivalContainer}>
                {renderArrivalInfo(bus.arrivalInfo, bus.routeno)}
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>아래로 당겨서 새로고침 ↓</Text>
          <Text style={styles.updateTime}>
            마지막 업데이트: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Container = styled.SafeAreaView`
  flex: 1;
`;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stationInfo: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  busItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  busNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0064ff',
  },
  busType: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  routeInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  arrivalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  arrivalItem: {
    marginBottom: 8,
  },
  arrivalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  lowBusText: {
    fontSize: 12,
    color: '#0064ff',
    marginTop: 4,
  },
  noArrival: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  noBusContainer: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  noBusText: {
    fontSize: 16,
    color: '#666',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0064ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  updateTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default BusArrival;

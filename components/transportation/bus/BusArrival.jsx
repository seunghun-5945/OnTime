import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

const BusArrival = ({stationRouteMap, targetNodeId}) => {
  const [busData, setBusData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArrivalInfo = async (nodeId, routeId) => {
    try {
      const res = await fetch(
        `https://apis.data.go.kr/6260000/BusArriveInfoService/getBusArriveInfo?serviceKey=발급받은키&bstopid=${nodeId}&lineid=${routeId}&numOfRows=1&pageNo=1&_type=json`,
      );
      const data = await res.json();
      return data.response?.body?.items?.item?.[0] || null;
    } catch (err) {
      console.error('❌ API 호출 오류:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadBusData = async () => {
      setLoading(true);

      const allRoutes = Object.values(stationRouteMap).flat();
      const uniqueMap = new Map();
      allRoutes.forEach(route => {
        if (!uniqueMap.has(route.routeid)) {
          uniqueMap.set(route.routeid, route);
        }
      });
      const uniqueRoutes = Array.from(uniqueMap.values());

      const withArrivalInfo = await Promise.all(
        uniqueRoutes.map(async route => {
          const arrival = await fetchArrivalInfo(targetNodeId, route.routeid);
          return {...route, arrival};
        }),
      );

      setBusData(withArrivalInfo);
      setLoading(false);
    };

    loadBusData();
  }, [stationRouteMap, targetNodeId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>버스 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🚌 도착 예정 버스</Text>
      {busData.map((bus, idx) => (
        <View key={idx} style={styles.busItem}>
          <Text style={styles.busNumber}>
            {bus.routeno}번 ({bus.routetp})
          </Text>
          {bus.arrival ? (
            <>
              <Text>도착까지 약 {bus.arrival.predictTime1}분</Text>
              <Text>{bus.arrival.locationNo1} 정거장 전</Text>
            </>
          ) : (
            <Text>도착 정보 없음</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  busItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  busNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
});

export default BusArrival;

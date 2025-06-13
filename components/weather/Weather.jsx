import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authKey, setAuthKey] = useState('');
  const [location, setLocation] = useState({nx: '60', ny: '127'}); // 서울 기본값
  const [refreshing, setRefreshing] = useState(false);

  // 기상현상 코드에 따른 이모지와 설명 매핑
  const getWeatherInfo = (skyCode, ptyCode) => {
    // 강수형태(PTY) 우선 확인
    if (ptyCode === '1') return {emoji: '🌧️', name: '비'};
    if (ptyCode === '2') return {emoji: '🌨️', name: '비/눈'};
    if (ptyCode === '3') return {emoji: '❄️', name: '눈'};
    if (ptyCode === '4') return {emoji: '🌦️', name: '소나기'};

    // 하늘상태(SKY) 확인
    if (skyCode === '1') return {emoji: '☀️', name: '맑음'};
    if (skyCode === '3') return {emoji: '⛅', name: '구름많음'};
    if (skyCode === '4') return {emoji: '☁️', name: '흐림'};

    return {emoji: '🌤️', name: '정보없음'};
  };

  // 현재 시간 기준으로 base_date, base_time 계산
  const getBaseDateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    let baseDate =
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');

    let ultraBaseTime = String(hours).padStart(2, '0') + '30';
    let shortBaseTime = '0500';

    // 초단기예보: 현재 시간이 30분 이전이면 이전 시간 사용
    if (minutes < 30) {
      const prevHour = hours === 0 ? 23 : hours - 1;
      ultraBaseTime = String(prevHour).padStart(2, '0') + '30';

      if (hours === 0) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        baseDate =
          yesterday.getFullYear() +
          String(yesterday.getMonth() + 1).padStart(2, '0') +
          String(yesterday.getDate()).padStart(2, '0');
      }
    }

    // 단기예보: 가장 최근 발표시간 계산
    const shortBaseTimes = [
      '0200',
      '0500',
      '0800',
      '1100',
      '1400',
      '1700',
      '2000',
      '2300',
    ];
    const currentTime =
      String(hours).padStart(2, '0') + String(minutes).padStart(2, '0');

    for (let i = shortBaseTimes.length - 1; i >= 0; i--) {
      if (currentTime >= shortBaseTimes[i]) {
        shortBaseTime = shortBaseTimes[i];
        break;
      }
    }

    return {baseDate, ultraBaseTime, shortBaseTime};
  };

  // 초단기예보 API 호출 (1시간 단위, 6시간)
  const fetchUltraShortForecast = async (baseDate, baseTime) => {
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${authKey}&pageNo=1&numOfRows=100&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${location.nx}&ny=${location.ny}`;

    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`초단기예보 API 오류: ${response.status}`);

    const data = await response.json();
    return data.response?.body?.items?.item || [];
  };

  // 단기예보 API 호출 (3시간 단위, 3일)
  const fetchShortForecast = async (baseDate, baseTime) => {
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${authKey}&pageNo=1&numOfRows=300&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${location.nx}&ny=${location.ny}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`단기예보 API 오류: ${response.status}`);

    const data = await response.json();
    return data.response?.body?.items?.item || [];
  };

  // 데모 데이터 생성
  const generateDemoData = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const sampleData = Array.from({length: 24}, (_, i) => {
      const hour = String(i).padStart(2, '0') + ':00';
      const temp =
        Math.floor(15 + 10 * Math.sin(((i - 6) * Math.PI) / 12)) +
        Math.floor(Math.random() * 5);
      const isRaining = Math.random() > 0.8;
      const skyCode = isRaining
        ? '4'
        : String(Math.floor(Math.random() * 3) + 1);
      const ptyCode = isRaining ? '1' : '0';

      return {
        time: hour,
        temperature: temp,
        sky: skyCode,
        precipitation: ptyCode,
        humidity: Math.floor(Math.random() * 40) + 40,
        isCurrentHour: i === currentHour,
      };
    });
    setWeatherData(sampleData);
  };

  // 날씨 데이터 가져오기
  const fetchWeatherData = async () => {
    if (!authKey.trim()) {
      Alert.alert('오류', 'API 키를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {baseDate, ultraBaseTime, shortBaseTime} = getBaseDateTime();

      // 초단기예보와 단기예보 동시 호출
      const [ultraData, shortData] = await Promise.all([
        fetchUltraShortForecast(baseDate, ultraBaseTime),
        fetchShortForecast(baseDate, shortBaseTime),
      ]);

      // 시간별로 데이터 그룹핑
      const hourlyData = {};

      // 초단기예보 데이터 처리 (1시간 단위)
      ultraData.forEach(item => {
        const dateTime = item.fcstDate + item.fcstTime;
        const hour = item.fcstTime.substring(0, 2) + ':00';

        if (!hourlyData[dateTime]) {
          hourlyData[dateTime] = {time: hour, date: item.fcstDate};
        }

        switch (item.category) {
          case 'T1H': // 기온
            hourlyData[dateTime].temperature = item.fcstValue;
            break;
          case 'SKY': // 하늘상태
            hourlyData[dateTime].sky = item.fcstValue;
            break;
          case 'PTY': // 강수형태
            hourlyData[dateTime].precipitation = item.fcstValue;
            break;
          case 'REH': // 습도
            hourlyData[dateTime].humidity = item.fcstValue;
            break;
        }
      });

      // 단기예보 데이터 처리 (3시간 단위로 보간)
      shortData.forEach(item => {
        const dateTime = item.fcstDate + item.fcstTime;
        const hour = item.fcstTime.substring(0, 2) + ':00';

        if (!hourlyData[dateTime]) {
          hourlyData[dateTime] = {time: hour, date: item.fcstDate};
        }

        switch (item.category) {
          case 'TMP': // 기온
            hourlyData[dateTime].temperature = item.fcstValue;
            break;
          case 'SKY': // 하늘상태
            hourlyData[dateTime].sky = item.fcstValue;
            break;
          case 'PTY': // 강수형태
            hourlyData[dateTime].precipitation = item.fcstValue;
            break;
          case 'REH': // 습도
            hourlyData[dateTime].humidity = item.fcstValue;
            break;
        }
      });

      // 오늘 24시간 데이터만 필터링하고 정렬
      const today = new Date();
      const todayStr =
        today.getFullYear() +
        String(today.getMonth() + 1).padStart(2, '0') +
        String(today.getDate()).padStart(2, '0');

      const todayData = Object.entries(hourlyData)
        .filter(([dateTime]) => dateTime.substring(0, 8) === todayStr)
        .map(([dateTime, data]) => ({
          time: data.time,
          temperature: data.temperature || '--',
          sky: data.sky || '1',
          precipitation: data.precipitation || '0',
          humidity: data.humidity || '--',
        }))
        .sort((a, b) => a.time.localeCompare(b.time));

      // 24시간 전체 채우기 (빈 시간은 기본값으로)
      const currentHour = today.getHours();
      const fullDayData = [];
      for (let i = 0; i < 24; i++) {
        const timeStr = String(i).padStart(2, '0') + ':00';
        const existingData = todayData.find(d => d.time === timeStr);

        if (existingData) {
          fullDayData.push({
            ...existingData,
            isCurrentHour: i === currentHour,
          });
        } else {
          fullDayData.push({
            time: timeStr,
            temperature: '--',
            sky: '1',
            precipitation: '0',
            humidity: '--',
            isCurrentHour: i === currentHour,
          });
        }
      }

      setWeatherData(fullDayData);
    } catch (err) {
      console.error('API 호출 오류:', err);
      setError(`오류 발생: ${err.message}`);

      // CORS 오류인 경우 안내 메시지와 함께 데모 데이터 표시
      if (err.message.includes('fetch') || err.message.includes('Network')) {
        Alert.alert(
          'CORS 오류',
          'React Native에서는 백엔드 서버를 통해 API를 호출해야 합니다. 데모 데이터를 표시합니다.',
          [{text: '확인'}],
        );
      }
      generateDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    if (authKey.trim()) {
      fetchWeatherData();
    } else {
      generateDemoData();
    }
    setRefreshing(false);
  };

  // 컴포넌트 마운트 시 데모 데이터 로드
  useEffect(() => {
    generateDemoData();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        <Text style={styles.title}>🌤️ 실시간 날씨 정보</Text>
        <Text style={styles.subtitle}>
          기상청 API를 통한 1시간 단위 날씨 예보
        </Text>
      </View>

      {/* API 설정 */}
      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>API 설정</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>API 키 (공공데이터포털)</Text>
          <TextInput
            style={styles.textInput}
            value={authKey}
            onChangeText={setAuthKey}
            placeholder="API 키를 입력하세요"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.locationInputs}>
          <View style={styles.locationInput}>
            <Text style={styles.inputLabel}>격자 X (nx)</Text>
            <TextInput
              style={styles.textInput}
              value={location.nx}
              onChangeText={text => setLocation({...location, nx: text})}
              keyboardType="numeric"
              placeholder="60"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.locationInput}>
            <Text style={styles.inputLabel}>격자 Y (ny)</Text>
            <TextInput
              style={styles.textInput}
              value={location.ny}
              onChangeText={text => setLocation({...location, ny: text})}
              keyboardType="numeric"
              placeholder="127"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.fetchButton, loading && styles.fetchButtonDisabled]}
          onPress={fetchWeatherData}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.fetchButtonText}>🔄 날씨 정보 가져오기</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoButton} onPress={generateDemoData}>
          <Text style={styles.demoButtonText}>📊 데모 데이터 보기</Text>
        </TouchableOpacity>
      </View>

      {/* 오류 메시지 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubText}>
            * React Native에서는 백엔드 서버를 통해 API를 호출해야 합니다.
          </Text>
          <Text style={styles.errorSubText}>
            * 현재 데모 데이터가 표시됩니다.
          </Text>
        </View>
      )}

      {/* 날씨 데이터 표시 */}
      {weatherData.length > 0 && (
        <View style={styles.weatherSection}>
          <Text style={styles.sectionTitle}>오늘의 시간대별 날씨</Text>

          <View style={styles.weatherGrid}>
            {weatherData.map((weather, index) => {
              const weatherInfo = getWeatherInfo(
                weather.sky,
                weather.precipitation,
              );

              return (
                <View
                  key={index}
                  style={[
                    styles.weatherCard,
                    weather.isCurrentHour && styles.currentHourCard,
                  ]}>
                  <View style={styles.timeContainer}>
                    <Text
                      style={[
                        styles.timeText,
                        weather.isCurrentHour && styles.currentTimeText,
                      ]}>
                      {weather.time}
                    </Text>
                    {weather.isCurrentHour && (
                      <Text style={styles.currentLabel}>현재</Text>
                    )}
                  </View>

                  <View style={styles.weatherIcon}>
                    <Text style={styles.emoji}>{weatherInfo.emoji}</Text>
                    <Text style={styles.weatherName}>{weatherInfo.name}</Text>
                  </View>

                  <View style={styles.tempContainer}>
                    <Text style={styles.temperature}>
                      {weather.temperature}°C
                    </Text>

                    {weather.humidity !== '--' && (
                      <Text style={styles.humidity}>
                        습도: {weather.humidity}%
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 사용 안내 */}
      {!weatherData.length && !loading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>☁️</Text>
          <Text style={styles.emptyText}>
            날씨 정보를 가져오려면 위의 버튼을 클릭하세요
          </Text>
          <Text style={styles.emptySubText}>
            공공데이터포털에서 기상청 API 키를 발급받아 입력해주세요
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  configSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  locationInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  locationInput: {
    flex: 0.48,
  },
  fetchButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  fetchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  fetchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoButton: {
    backgroundColor: '#50C878',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  errorSubText: {
    color: '#e57373',
    fontSize: 12,
    marginBottom: 4,
  },
  weatherSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weatherCard: {
    width: (width - 72) / 3, // 3열 그리드
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  currentHourCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  currentTimeText: {
    color: '#2196f3',
  },
  currentLabel: {
    fontSize: 10,
    backgroundColor: '#2196f3',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  weatherIcon: {
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  weatherName: {
    fontSize: 10,
    color: '#666',
  },
  tempContainer: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  humidity: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default WeatherApp;

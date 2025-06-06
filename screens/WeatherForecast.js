import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import axios from 'axios';

// OpenWeatherMap API 설정
const API_KEY = '3d2102fbe83b471446c3d028854b6984'; // 실제 API 키로 교체
const CITY_NAME = 'Busan';

// 날씨 이모지 매핑
const getWeatherEmoji = description => {
  const emojiMap = {
    'clear sky': '☀️',
    'few clouds': '🌤️',
    'scattered clouds': '⛅',
    'broken clouds': '☁️',
    'shower rain': '🌦️',
    rain: '🌧️',
    thunderstorm: '⛈️',
    snow: '❄️',
    mist: '🌫️',
  };

  return emojiMap[description.toLowerCase()] || '🌈';
};

export default function WeatherForecast() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${CITY_NAME}&units=metric&appid=${API_KEY}`,
      );
      setWeather(response.data);
    } catch (err) {
      console.error('날씨 데이터 불러오기 실패:', err);
      setError('날씨 정보를 가져올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  // 로딩 상태 렌더링
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0064ff" />
      </View>
    );
  }

  // 에러 상태 렌더링
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // 시간별 예보 렌더링
  const renderHourlyForecast = () => {
    const hourlyData = weather?.list || [];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.hourlyContainer}>
        {hourlyData.map((forecast, index) => {
          const time = new Date(forecast.dt * 1000);
          const weatherDescription = forecast.weather[0].description;

          return (
            <View key={index} style={styles.hourlyItem}>
              <Text style={styles.timeText}>
                {time.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={styles.weatherEmoji}>
                {getWeatherEmoji(weatherDescription)}
              </Text>
              <Text style={styles.temperatureText}>
                {Math.round(forecast.main.temp)}°C
              </Text>
              <Text style={styles.descriptionText}>{weatherDescription}</Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  // 추가 날씨 정보 렌더링
  const renderAdditionalInfo = () => {
    if (!weather || !weather.list.length) return null;

    const currentWeather = weather.list[0];

    return (
      <View style={styles.additionalInfoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>체감 온도</Text>
          <Text style={styles.infoValue}>
            {Math.round(currentWeather.main.feels_like)}°C
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>습도</Text>
          <Text style={styles.infoValue}>{currentWeather.main.humidity}%</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.cityTitle}>{CITY_NAME} 날씨</Text>
      <Text style={styles.title}>시간별 예보</Text>
      {renderHourlyForecast()}
      {renderAdditionalInfo()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  cityTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    color: '#34495e',
    marginBottom: 15,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 18,
    textAlign: 'center',
  },
  hourlyContainer: {
    paddingHorizontal: 10,
  },
  hourlyItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 120,
  },
  timeText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  weatherEmoji: {
    fontSize: 40,
    marginBottom: 5,
  },
  temperatureText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2980b9',
  },
  descriptionText: {
    fontSize: 12,
    color: '#95a5a6',
    textTransform: 'capitalize',
  },
  additionalInfoContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2980b9',
  },
});

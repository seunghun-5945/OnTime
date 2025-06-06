// src/api/busApi.js
import axios from 'axios';

const serviceKey =
  'RKIYsmDDY6qFhbQnqjZ34tezXfFMp8j8lzQdRUGkm6Ydhe+sxopdX5kmtMxKeuHr2U/0dvbgReF+9Dgbm20t1Q==';

export const busApi = {
  // 1. 도시코드 목록 조회
  fetchCityCodeList: async () => {
    try {
      const response = await axios.request({
        method: 'get',
        url: 'https://apis.data.go.kr/1613000/ArvlInfoInqireService/getCtyCodeList',
        params: {
          serviceKey: serviceKey,
          _type: 'json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('도시코드 목록 조회 오류:', error);
      throw error;
    }
  },

  // 2. 정류소 정보 조회
  fetchStationInfo: async (cityCode, stationName) => {
    try {
      const response = await axios.request({
        method: 'get',
        url: 'https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getSttnNoList',
        params: {
          serviceKey: serviceKey,
          cityCode: cityCode,
          nodeNm: stationName,
          numOfRows: '10',
          pageNo: '1',
          _type: 'json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('정류소 정보 조회 오류:', error);
      throw error;
    }
  },

  // 3. 버스 도착 정보 조회
  fetchBusArrivalInfo: async (cityCode, nodeId) => {
    try {
      const response = await axios.request({
        method: 'get',
        url: 'https://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList',
        params: {
          serviceKey: serviceKey,
          cityCode: cityCode,
          nodeId: nodeId,
          numOfRows: '20',
          pageNo: '1',
          _type: 'json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('버스 도착 정보 조회 오류:', error);
      throw error;
    }
  },

  // 도착 예정 시간 포맷 유틸리티 함수
  formatArrivalTime: seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  },
};

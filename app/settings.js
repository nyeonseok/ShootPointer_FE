import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Image, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import ConfirmModal from './ConfirmModal';

export default function SettingsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const showToast = () => {
    setToastVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setToastVisible(false));
      }, 1500);
    });
  };

  const showModal = (action) => {
    if (action === 'notification') {
      if (notificationsEnabled) {
        // 🔕 알림 끄기일 때만 확인 모달 띄움
        setModalAction('notification');
        setModalVisible(true);
      } else {
        // 🔔 알림 켜기일 때는 바로 토글 + 이미지 표시
        setNotificationsEnabled(true);
        showToast();
      }
    } else {
      setModalAction(action);
      setModalVisible(true);
    }
  };

  const handleConfirm = async () => {
    setModalVisible(false);

    if (modalAction === 'logout') {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      router.replace('/login');
    } 
    else if (modalAction === 'delete') {
      await AsyncStorage.clear();
      router.replace('/login');
    } 
    else if (modalAction === 'notification') {
      // 알림 끄기 확정 시
      setNotificationsEnabled(false);
      showToast();
    }
  };

  return (
    <View style={styles.container}>
      {/* 알림 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림</Text>
        <View style={styles.row}>
          <Text style={styles.label}>알림 받기</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={() => showModal('notification')}
            trackColor={{ false: '#ccc', true: '#FF7F50' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* 기타 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기타</Text>
        <TouchableOpacity style={styles.button} onPress={() => showModal('logout')}>
          <Text style={styles.buttonText}>로그아웃</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => showModal('delete')}>
          <Text style={styles.buttonText}>회원 탈퇴</Text>
        </TouchableOpacity>
      </View>

      {/* ConfirmModal */}
      <ConfirmModal
        title={
          modalAction === 'logout'
            ? '로그아웃'
            : modalAction === 'delete'
            ? '회원탈퇴'
            : '알림 끄기'
        }
        visible={modalVisible}
        onConfirm={handleConfirm}
        onCancel={() => setModalVisible(false)}
        message={
          modalAction === 'logout'
            ? '정말 로그아웃 하시겠습니까?'
            : modalAction === 'delete'
            ? '회원님의 하이라이트를 더는 볼 수 없다니 너무 아쉬워요...'
            : '다양한 소식과 각종 정보를 받지 못할 수 있어요'
        }
      />

      {/* ✅ 메시지 이미지 토스트 */}
      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
          <Image
            source={
              notificationsEnabled
                ? require('../assets/images/bell_on.png')   // 알림 켜짐 이미지
                : require('../assets/images/bell_off.png')  // 알림 꺼짐 이미지
            }
            style={styles.toastImage}
            resizeMode="contain"
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    padding: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  button: {
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  buttonText: {
    color: '#FF5A5F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toastImage: {
    width: 350,   // 이미지 크기 조정
  },
});

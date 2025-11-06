import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

const dummyUser = {
  id: 1,
  name: "백진욱",
  number: "No.3",
  profileImage: "https://picsum.photos/200", // 실제 프로필 이미지 경로로 교체
};

export default function MyPointerScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(dummyUser);
  }, []);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#fff" }}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 타이틀 */}
      <View style={styles.header}>
        <Text style={styles.title}>마이포인터</Text>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Image
            source={require("../../assets/images/Settings.png")}
            style={styles.settingsIcon}
          />
        </TouchableOpacity>
      </View>

      {/* 슬로건 */}
      <View style={styles.sloganBox}>
  <Image
    source={require("../../assets/images/Ballpointer.png")}
    style={styles.ballpointerIcon}
  />
  <Text style={styles.sloganText}>
    골 넣는 순간의 짜릿함, 슛포인터와 함께해요!
  </Text>
</View>
      {/* 프로필 카드 */}
      <View style={styles.profileCard}>
        <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userNumber}>{user.number}</Text>
        </View>
      </View>

      {/* 활동 버튼 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/mypage/liked")}
        >
          <Image
            source={require("../../assets/images/mpHeart.png")}
            style={styles.icon}
          />
          <Text style={styles.actionText}>좋아요한 글</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/mypage/myposts")}
        >
          <Image
            source={require("../../assets/images/mpDocument.png")}
            style={styles.icon}
          />
          <Text style={styles.actionText}>게시한 글</Text>
        </TouchableOpacity>
      </View>

      {/* 히스토리 섹션 */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>히스토리</Text>
        <TouchableOpacity
          style={styles.historyItem}
          onPress={() => router.push("/mypage/highlight")}
        >
          <Image
            source={require("../../assets/images/Star.png")}
            style={styles.historyIcon}
          />
          <Text style={styles.historyText}>하이라이트 내역</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#111" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",

  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 40,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  settingsIcon: { width: 24, height: 24, tintColor: "#ccc" },

  sloganBox: {
    backgroundColor: "#1f1f1f",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  sloganText: { color: "#ccc", fontSize: 14 },

  profileCard: {
    backgroundColor: "#1f1f1f",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 20,
  },
  profileImage: { width: 70, height: 70, borderRadius: 35, marginRight: 15 },
  profileInfo: {},
  userName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  userNumber: { color: "#bbb", fontSize: 14 },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#1f1f1f",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    marginHorizontal: 5,
  },
  icon: { width: 14, height: 14, marginBottom: 5, tintColor: "#fff" },
  actionText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  historySection: {
    backgroundColor: "#1f1f1f",
    borderRadius: 10,
    padding: 15,
  },
  historyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  historyIcon: { width: 20, height: 20, marginRight: 10, tintColor: "#fff" },
  historyText: { color: "#fff", fontSize: 15 },
  sloganBox: {
  flexDirection: "row", // 가로로 정렬
  alignItems: "center", // 세로 가운데 정렬
  backgroundColor: "#1f1f1f",
  borderRadius: 10,
  padding: 10,
  marginBottom: 15,
},
ballpointerIcon: {
  width: 40,   // 필요에 따라 조절
  height: 40,
  resizeMode: "contain",
  tintColor: "#FF6B00",
  marginLeft:10,
  marginRight:10,
},
sloganText: { 
  color: "#ccc", 
  fontSize: 14 
},

});

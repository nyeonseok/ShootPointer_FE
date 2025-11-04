import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, StyleSheet } from "react-native";

export default function FrontendUpload({ jerseyNumber, frontImage }) {
  const [uploading, setUploading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [highlightReady, setHighlightReady] = useState(false);
  const [highlightUrl, setHighlightUrl] = useState(null);

  // 1️⃣ 업로드 요청 (촬영된 이미지 + 등번호)
  const uploadImage = async () => {
    try {
      const formData = new FormData();
      formData.append("jerseyNumber", jerseyNumber);
      formData.append("file", {
        uri: frontImage,
        name: "backshot.jpg",
        type: "image/jpeg",
      });

      const res = await fetch("https://your-server.com/api/upload", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.ok) throw new Error("업로드 실패");
      console.log("✅ 이미지 업로드 성공");
    } catch (err) {
      console.error("❌ 업로드 실패:", err);
      Alert.alert("업로드 실패", "이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  // 2️⃣ WebSocket 연결 (하이라이트 생성 완료 감지)
  useEffect(() => {
    const ws = new WebSocket("wss://your-server.com/highlight");

    ws.onopen = () => {
      console.log("✅ WebSocket 연결됨");
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 WebSocket 수신:", data);

      // 서버에서 “하이라이트 생성 완료” PUB → SUB 후 클라이언트로 전달됨
      if (data.type === "highlight_done") {
        setHighlightReady(true);
        setHighlightUrl(data.url); // 서버가 URL 전달 시
        Alert.alert("🎬 하이라이트 영상 생성 완료!", "영상이 준비되었습니다.");
      }
    };

    ws.onerror = (err) => console.error("⚠️ WebSocket 오류:", err);
    ws.onclose = () => console.log("🔌 WebSocket 연결 종료");

    return () => ws.close();
  }, []);

  useEffect(() => {
    uploadImage();
  }, []);

  // 3️⃣ 하이라이트 영상 선택 요청
  const handleSelectHighlight = async () => {
    try {
      const res = await fetch("https://your-server.com/api/selectHighlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jerseyNumber }),
      });

      if (!res.ok) throw new Error("영상 선택 실패");
      Alert.alert("✅ 선택 완료", "하이라이트 영상이 선택되었습니다.");
    } catch (err) {
      console.error(err);
      Alert.alert("❌ 실패", "하이라이트 선택 중 오류 발생");
    }
  };

  return (
    <View style={styles.container}>
      {uploading ? (
        <>
          <ActivityIndicator size="large" color="#ff6a33" />
          <Text style={styles.text}>하이라이트 영상 생성 중...</Text>
        </>
      ) : highlightReady ? (
        <>
          <Text style={styles.successText}>🎥 하이라이트 영상 생성 완료!</Text>
          {highlightUrl && (
            <TouchableOpacity onPress={() => Alert.alert("영상 URL", highlightUrl)}>
              <Text style={styles.linkText}>영상 보러가기</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.selectButton} onPress={handleSelectHighlight}>
            <Text style={styles.selectText}>이 영상 선택하기</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.text}>
            {wsConnected
              ? "⏳ 하이라이트 생성 대기 중..."
              : "WebSocket 연결 중..."}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  text: { color: "white", marginTop: 15, fontSize: 16 },
  successText: { color: "#ff6a33", fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  linkText: { color: "#33aaff", marginTop: 8 },
  selectButton: {
    marginTop: 20,
    backgroundColor: "#ff6a33",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectText: { color: "white", fontSize: 16 },
});

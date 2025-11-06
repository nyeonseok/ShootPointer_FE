import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Button, Image, Text, View } from "react-native";

const FrontendUpload = ({ jerseyNumber, frontImage }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [videoOk, setVideoOk] = useState<Boolean>(false);

  // 실제 JWT 토큰과 멤버 ID 값으로 바꾸세요
  const JWT_TOKEN = "Bearer YOUR_JWT_TOKEN_HERE";
  const MEMBER_ID = "123";

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) setVideoFile(result.assets[0]);
  };

  const handleUpload = async () => {
    setIsUploading(true);

    try {
      const formData = new FormData();

      // if (Platform.OS === "web") {
      //   const response = await fetch(videoFile.uri);
      //   const blob = await response.blob();
      //   formData.append("video", blob, "video.mp4");
      // } else {
      //   formData.append("video", {
      //     uri: videoFile.uri,
      //     name: "video.mp4",
      //     type: "video/mp4",
      //   });
      // }

      
    // 등번호와 촬영 사진도 같이
    formData.append(
      "backNumberRequestDto",
      JSON.stringify({ backNumber: Number(jerseyNumber) })
    );
    if (frontImage) {
      formData.append("image", {
        uri: frontImage,
        name: "photo.jpg",
        type: "image/jpeg",
      });
    }

    const res = await api.post(
      "https://tkv00.ddns.net/api/backNumber",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    setVideoOk(true);
    // setUploadResult("✅ 업로드 성공: " + JSON.stringify(res.data));
  } catch (error) {
    console.error("❌ 오류:", error);
    Alert.alert("업로드 실패", error?.message || "오류 발생");
  } finally {
    setIsUploading(false);
  }
};


  return (
    <View style={{ padding: 20 }}>
      {!videoOk && (
        <>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>등번호: {jerseyNumber}</Text>
          {frontImage && <Image source={{ uri: frontImage }} style={{ width: 330, height: 500, marginBottom: 10 }} />}
          
          
          <View style={{ height: 10 }} />
          <Button
            title={isUploading ? "업로드 중..." : "업로드"}
            onPress={handleUpload}
            disabled={isUploading}/>
        </>
      )}
      {videoOk && ( 
        <View style={{ marginTop: 20 }}>
          <Button title="🎥 영상 선택" onPress={pickVideo} />
        </View>
      )}

      {uploadResult && (
        <View style={{ marginTop: 20 }}>
          <Text>서버 응답:</Text>
          <Text>{uploadResult}</Text>
        </View>
      )}
    </View>
  );
};

export default FrontendUpload;

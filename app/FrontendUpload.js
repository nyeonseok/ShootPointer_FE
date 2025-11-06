import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Button, Image, Text, View } from "react-native";



const FrontendUpload = ({ jerseyNumber, frontImage }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoName, setVideoName] = useState<String>("");
  const [videoSize, setVideoSize] = useState<Number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [videoOk, setVideoOk] = useState<Boolean>(false);
  const [videoUpload, setVideoUpload] = useState<Boolean>(false);
  // const [presignedURL, setPresignedURL] = useState<String>("");

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return; 
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Videos",
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) { // 로그 찍으면서 값이 들어가는지 확인 필요
      const videoAsset = result.assets[0];
      setVideoName(videoAsset.fileName || videoAsset.uri.split("/").pop());
      setVideoSize(videoAsset.fileSize ?? (await FileSystem.getInfoAsync(videoAsset.uri)).size);
      setVideoFile(videoAsset);
    }
  };

  //pre-signed 발급 함수
  const getPresignedUrlFromServer =async()=>{
    try{
      const response = await api.post("https://tkv00.ddns.net/api/pre-signed",{
        fileName:videoName,
        fileSize:videoSize
      })
      if (response.status === 200){
         return response.data.presignedUrl 
      }
    } catch(error){
      console.error("Presigned URL 요청 실패:", error);
      throw error; 
    }
  }

  const uploadVideoToPython = async(url, video)=>{

  }

  //비디오 업로드 함수
  const handleVideoUpload = async () => {
    setVideoUpload(true);

    try {
      // pre-signed URL 발급
      const presignedUrl = await getPresignedUrlFromServer();

      if (!presignedUrl) {
        Alert.alert("업로드 실패","Pre-signed URL 못받음ㅜ");
        setVideoUpload(false);
        return;
      }

      // 파이썬 서버로 업로드, 전송 데이터는 얘기 맞춰봐야할듯 
      await uploadVideoToPython(presignedUrl, videoData);  
    } catch (error) {
      console.error("비디오 업로드 실패:", error);
      Alert.alert("업로드 실패", "비디오 업로드 중 오류발생ㅜ");
    } finally {
      setVideoUpload(false);
    }
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
          <View style={{height:10}}/>
          <Button title={videoUpload ? "업로드 중..." : "업로드"}
            onPress={handleVideoUpload}
            disabled={videoUpload}/>
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

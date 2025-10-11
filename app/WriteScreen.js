import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Video } from "expo-av";

export default function WriteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { posts, setPosts } = route.params;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTag, setSelectedTag] = useState("TWO_POINT"); // 기본값
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState("image");

  useEffect(() => {
    pickMedia();
  }, []);

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
      setMediaType(result.assets[0].type || "image");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("제목을 입력해주세요.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("내용을 입력해주세요.");
      return;
    }

    try {
      const highlightId = "d90DCCAA-DdE4-40c8-CCD1-9dFf70aABd76"; // 실제 DB에 있는 값으로 변경

      const response = await fetch("http://tkv00.ddns.net:9000/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          highlightId,
          title,
          content: description,
          hashTag: selectedTag,
        }),
      });

      const result = await response.json();
      console.log("서버 응답:", result);

      if (!result.success) {
        const message = result?.error?.message || "업로드 실패";
        Alert.alert("업로드 실패", message);
        return;
      }

      Alert.alert("업로드 완료", "게시물이 등록되었습니다.");

      const newPost = {
        id: highlightId,
        author: "익명",
        title,
        type: mediaType === "video" ? "video" : "image",
        media: media || "https://picsum.photos/400/300",
        description,
        likes: 0,
        liked: false,
        hashTag: selectedTag,
      };

      setPosts([newPost, ...posts]);
      navigation.goBack();
    } catch (error) {
      console.error("네트워크 에러:", error);
      Alert.alert("오류", "서버와 연결할 수 없습니다.");
    }
  };

  return (
    <View style={styles.container}>
      {media && (
        mediaType === "image" ? (
          <Image source={{ uri: media }} style={styles.preview} />
        ) : (
          <Video
            source={{ uri: media }}
            style={styles.preview}
            useNativeControls
            resizeMode="cover"
            isLooping
          />
        )
      )}

      {/* 제목 입력 */}
      <TextInput
        placeholder="제목을 입력하세요"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
        style={styles.titleInput}
      />

      {/* 내용 입력 */}
      <TextInput
        placeholder="내용을 입력하세요"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
      />

      {/* 해시태그 선택 */}
      <View style={styles.tagContainer}>
        {["TWO_POINT", "THREE_POINT"].map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagButton,
              selectedTag === tag && styles.tagButtonSelected,
            ]}
            onPress={() => setSelectedTag(tag)}
          >
            <Text
              style={[
                styles.tagText,
                selectedTag === tag && styles.tagTextSelected,
              ]}
            >
              {tag === "TWO_POINT" ? "2점 슛" : "3점 슛"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>등록</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#111" },
  titleInput: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    minHeight: 180,
    textAlignVertical: "top",
  },
  preview: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  tagContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  tagButton: {
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tagButtonSelected: {
    backgroundColor: "#ff6a33",
  },
  tagText: {
    color: "#ccc",
    fontSize: 14,
  },
  tagTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#ff6a33",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

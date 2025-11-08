import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Video } from "expo-av";
import { Stack, useRouter } from "expo-router";

const { height } = Dimensions.get("window");

export default function MyPostsScreen() {
  const router = useRouter();

  // ✅ 게시물 구조 수정 (highlightId, title, content, hashTag)
  const [posts, setPosts] = useState(
    Array.from({ length: 8 }).map((_, i) => ({
      highlightId: `highlight-${i + 1}`,
      title: `하이라이트 영상 ${i + 1}`,
      content: `이것은 게시물 ${i + 1}의 내용입니다.`,
      hashTag: i % 2 === 0 ? "TWO_POINT" : "THREE_POINT",
      type: i % 2 === 0 ? "image" : "video",
      media:
        i % 2 === 0
          ? "https://picsum.photos/400/300"
          : "https://www.w3schools.com/html/mov_bbb.mp4",
      likes: Math.floor(Math.random() * 50),
      likedByMe: i % 2 === 0,
    }))
  );

  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(height))[0];

  // ✅ 무한 스크롤
  const loadMorePosts = () => {
    if (loadingMore) return;
    setLoadingMore(true);

    setTimeout(() => {
      const more = Array.from({ length: 8 }).map((_, i) => ({
        highlightId: `highlight-${posts.length + i + 1}`,
        title: `하이라이트 영상 ${posts.length + i + 1}`,
        content: `이것은 게시물 ${posts.length + i + 1}의 내용입니다.`,
        hashTag: (posts.length + i) % 2 === 0 ? "TWO_POINT" : "THREE_POINT",
        type: (posts.length + i) % 2 === 0 ? "image" : "video",
        media:
          (posts.length + i) % 2 === 0
            ? "https://picsum.photos/400/300"
            : "https://www.w3schools.com/html/mov_bbb.mp4",
        likes: Math.floor(Math.random() * 50),
        likedByMe: false,
      }));
      setPosts((prev) => [...prev, ...more]);
      setLoadingMore(false);
    }, 1000);
  };

  // ✅ 좋아요 토글
  const toggleLike = (highlightId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.highlightId === highlightId
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  };

  // ✅ etc 클릭 시 모달 열기
  const handleEtcPress = (post) => {
    setSelectedPost(post);
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: height - 200,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setModalVisible(false);
      setSelectedPost(null);
    });
  };

  // ✅ 수정 페이지 이동
  const handleEdit = () => {
    if (!selectedPost) return;
    closeModal();
    router.push({
      pathname: "/mypage/editpost",
      params: {
        highlightId: selectedPost.highlightId,
        title: selectedPost.title,
        content: selectedPost.content,
        hashTag: selectedPost.hashTag,
      },
    });
  };

  // ✅ 삭제 (API는 나중에)
  const handleDelete = async () => {
    if (!selectedPost) return;
    closeModal();
    Alert.alert("삭제 확인", "정말 이 게시물을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            setPosts((prev) =>
              prev.filter((p) => p.highlightId !== selectedPost.highlightId)
            );
            Alert.alert("삭제 완료", "게시물이 삭제되었습니다.");
          } catch (e) {
            Alert.alert("삭제 실패", "다시 시도해주세요.");
          }
        },
      },
    ]);
  };

  // ✅ 게시물 렌더링
  const renderItem = ({ item }) => (
    <View style={styles.post}>
      <Text style={styles.title}>{item.title}</Text>

      {item.type === "image" ? (
        <Image source={{ uri: item.media }} style={styles.media} />
      ) : (
        <Video
          source={{ uri: item.media }}
          style={styles.media}
          useNativeControls
          resizeMode="cover"
          isLooping
        />
      )}

      <Text style={styles.description}>{item.content}</Text>
      <Text style={styles.hashtag}>#{item.hashTag}</Text>

      <View style={styles.bottomActions}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            onPress={() => toggleLike(item.highlightId)}
            style={styles.iconButton}
          >
            <Image
              source={
                item.likedByMe
                  ? require("../../assets/images/Filledheart.png")
                  : require("../../assets/images/Heart.png")
              }
              style={styles.icon}
            />
            <Text style={styles.likeCount}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              Alert.alert("댓글", "댓글 화면은 추후 연결 예정입니다.")
            }
          >
            <Image
              source={require("../../assets/images/Comment.png")}
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => Alert.alert("공유", "공유 기능은 준비 중입니다")}
          >
            <Image
              source={require("../../assets/images/Send.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => handleEtcPress(item)}>
          <Image
            source={require("../../assets/images/etc.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../../assets/images/back.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 게시물</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.highlightId}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && (
            <ActivityIndicator size="large" color="#ff6a33" style={{ margin: 20 }} />
          )
        }
      />

      {/* ✅ 수정/삭제 모달 */}
      {modalVisible && selectedPost && (
        <Modal transparent visible animationType="none">
          <TouchableOpacity
            activeOpacity={1}
            onPressOut={closeModal}
            style={styles.overlay}
          >
            <Animated.View style={[styles.modalBox, { top: slideAnim }]}>
              <TouchableOpacity onPress={handleEdit} style={styles.modalButton}>
                <Text style={styles.modalText}>게시물 수정</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              <TouchableOpacity onPress={handleDelete} style={styles.modalButton}>
                <Text style={[styles.modalText, { color: "#ff4d4d" }]}>
                  게시물 삭제
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 15 },
  post: { padding: 15, backgroundColor: "#000", borderRadius: 12, marginTop: 20 },
  title: { fontWeight: "bold", color: "#fff", fontSize: 16, marginBottom: 5 },
  media: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  description: { color: "#ddd", marginBottom: 5 },
  hashtag: { color: "#ffb400", marginBottom: 10 },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftActions: { flexDirection: "row", alignItems: "center" },
  iconButton: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  icon: { width: 22, height: 22, tintColor: "#fff" },
  likeCount: { color: "#fff", marginLeft: 4 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: {
    position: "absolute",
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  modalButton: { paddingVertical: 14, width: "90%", alignItems: "center" },
  modalText: { color: "#fff", fontSize: 16 },
  separator: { height: 1, backgroundColor: "#333", width: "90%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
    backgroundColor: "#111111",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  backIcon: { width: 28, height: 28, tintColor: "#fff" },
});

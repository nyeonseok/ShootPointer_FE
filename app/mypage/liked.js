// app/mypage/liked.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Video } from "expo-av";
import { Stack, useRouter } from "expo-router";
// import api, { likePost, unlikePost } from "../api/api"; // 실제 API 연결 시 사용

export default function LikedScreen() {
  const router = useRouter();

  // 더미 데이터 (페이지 단위로 제공)
  const ALL_DUMMY = Array.from({ length: 50 }).map((_, i) => ({
    postId: (i + 1),
    memberName: `사용자${i + 1}`,
    title: `좋아요한 게시물 ${i + 1}`,
    content: `좋아요한 게시물 예시 내용 ${i + 1}`,
    likeCnt: Math.floor(Math.random() * 100),
    highlightUrl: i % 3 === 0 ? "https://www.w3schools.com/html/mov_bbb.mp4" : `https://picsum.photos/400/30${i}`,
    hashTag: i % 4 === 0 ? "#예시" : "",
    // UI 전용 상태
    likedByMe: true,
  }));

  const PAGE_SIZE = 10;
  const [posts, setPosts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 초기 로드 및 페이지 변경 시 추가 로드
  useEffect(() => {
    loadPosts(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (page > 1) loadPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 실제 API 사용 시 이 함수 내부의 주석을 교체하면 됨
  const loadPosts = async (loadMore = false) => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      // ---------- 실제 API 예시 (주석 처리) ----------
      // if (loadMore) {
      //   const res = await api.get("/api/post/liked", { params: { lastPostId: lastId, size: PAGE_SIZE }});
      //   // 가공 후 setPosts(prev => [...prev, ...newPosts])
      // } else {
      //   const res = await api.get("/api/post/liked", { params: { size: PAGE_SIZE }});
      //   // 가공 후 setPosts(newPosts)
      // }
      // ------------------------------------------------

      // 더미 데이터 페이징 시뮬레이션
      const start = (page - 1) * PAGE_SIZE;
      const next = ALL_DUMMY.slice(start, start + PAGE_SIZE);
      if (!next || next.length === 0) {
        setHasMore(false);
      } else {
        const mapped = next.map((p) => ({
          postId: p.postId,
          author: p.memberName,
          title: p.title,
          description: p.content,
          likes: p.likeCnt,
          type: p.highlightUrl?.endsWith(".mp4") ? "video" : "image",
          media: p.highlightUrl,
          likedByMe: p.likedByMe,
          hashTag: p.hashTag,
        }));
        setPosts((prev) => (loadMore ? [...prev, ...mapped] : mapped));
        if (next.length < PAGE_SIZE) setHasMore(false);
      }
    } catch (err) {
      console.error("좋아요한 게시물 로드 오류:", err);
      Alert.alert("오류", "좋아요한 게시물 로드 중 오류가 발생했습니다.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setPage((p) => p + 1);
  };

  // 좋아요 토글 (UI만 변경, API 주석)
  const toggleLike = async (postId, liked) => {
    try {
      // 실제 API 호출 예시 (주석)
      // const result = liked ? await unlikePost(postId) : await likePost(postId);
      // if (result.success) { ... }

      setPosts((prev) =>
        prev.map((post) =>
          post.postId === postId
            ? {
                ...post,
                likedByMe: !post.likedByMe,
                likes: post.likedByMe ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );
    } catch (err) {
      console.error("좋아요 처리 오류:", err);
    }
  };

  // 댓글 버튼 (임시)
  const goToComments = (postId) => {
    router.push({
      pathname: "/CommentScreen",
      params: { postId: String(postId) },
    });
  };

  // 게시물 클릭 -> 상세 페이지 이동 (임시)
  const openPost = (postId) => {
    router.push({
      pathname: "/PostDetailScreen",
      params: { postId: String(postId) },
    });
  };

  // 렌더러 (CommunityScreen 구조와 동일하게, 아이콘도 동일 이름 사용)
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openPost(item.postId)}>
      <View style={styles.post}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>

        {item.type === "image" ? (
          <Image source={{ uri: item.media }} style={styles.media} />
        ) : (
          <Video source={{ uri: item.media }} style={styles.media} useNativeControls resizeMode="cover" isLooping />
        )}

        <Text style={styles.description}>{item.description}</Text>
        {item.hashTag ? <Text style={styles.hashtag}>{item.hashTag}</Text> : null}

        <View style={styles.bottomActions}>
          <View style={styles.leftActions}>
            <TouchableOpacity onPress={() => toggleLike(item.postId, item.likedByMe)} style={styles.iconButton}>
              <Image
                source={
                  item.likedByMe
                    ? require("../../assets/images/Filledheart.png")
                    : require("../../assets/images/Heart.png")
                }
                style={styles.icon}
              />
              <Text style={styles.likeCount}>{item.likes ?? item.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => goToComments(item.postId)}>
              <Image source={require("../../assets/images/Comment.png")} style={styles.icon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert("공유", "이 게시물의 링크를 복사했습니다!")}>
              <Image source={require("../../assets/images/Send.png")} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* 헤더 (Community와 동일 위치/스타일) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={require("../../assets/images/back.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>좋아요한 게시물</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* 리스트 */}
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.postId)}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={(loadingMore) && <ActivityIndicator size="large" color="#ff6a33" style={{ margin: 20 }} />}
        contentContainerStyle={{ padding: 15, paddingTop: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
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

  post: { padding: 15, backgroundColor: "#000", borderRadius: 12, marginTop: 20, },
  title: { fontWeight: "bold", color: "#fff", fontSize: 16, marginBottom: 5 },
  author: { fontWeight: "bold", color: "#fff", marginBottom: 5 },
  media: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  description: { color: "#ddd", marginBottom: 5 },
  hashtag: { color: "#ffb400", marginBottom: 10 },
  bottomActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  leftActions: { flexDirection: "row", alignItems: "center" },
  iconButton: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  icon: { width: 22, height: 22, tintColor: "#fff" },
  likeCount: { color: "#fff", marginLeft: 6 },
});

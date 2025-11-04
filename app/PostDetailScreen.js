// PostDetailScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Video } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import api from "./api/api";

// 댓글 아이템
const CommentItem = React.memo(({ item, onDelete }) => (
  <View style={styles.commentItem}>
    <View style={{ flex: 1 }}>
      <Text style={styles.commentAuthor}>{item.memberName}</Text>
      <Text style={styles.commentContent}>{item.content}</Text>
      <Text style={styles.commentDate}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
    <TouchableOpacity onPress={() => onDelete(String(item.commentId))}>
      <Text style={styles.deleteText}>삭제</Text>
    </TouchableOpacity>
  </View>
));

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  // 게시물 단건 조회
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/post/${postId}`);
        if (res.data.success) setPost(res.data.data);
        else Alert.alert("오류", "게시물을 불러오지 못했습니다.");
      } catch (err) {
        console.error("게시물 조회 오류:", err);
        Alert.alert("오류", "게시물 조회 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  // 댓글 조회
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setCommentLoading(true);
    try {
      const res = await api.get(`/api/comment/${postId}`);
      if (res.data.success) setComments(res.data.data || []);
      else setComments([]);
    } catch (err) {
      console.error("댓글 조회 오류:", err);
      setComments([]);
    } finally {
      setCommentLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 댓글 작성
  const handleAddComment = async () => {
    if (!newComment.trim() || !postId) return;
    setSending(true);
    try {
      const res = await api.post(`/api/comment`, {
        postId,
        content: newComment.trim(),
      });
      if (res.data.success) {
        setNewComment("");
        fetchComments();
      } else {
        Alert.alert("댓글 작성 실패", res.data.msg || "다시 시도해주세요");
      }
    } catch (err) {
      console.error("댓글 작성 오류:", err);
      Alert.alert("오류", "댓글 작성 중 문제가 발생했습니다.");
    } finally {
      setSending(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = useCallback((commentId) => {
    Alert.alert("삭제", "댓글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await api.delete(`/api/comment/${commentId}`);
            if (res.data.success) {
              setComments((prev) =>
                prev.filter((c) => String(c.commentId) !== commentId)
              );
            } else {
              Alert.alert("댓글 삭제 실패", res.data.msg || "다시 시도해주세요");
            }
          } catch (err) {
            console.error("댓글 삭제 오류:", err);
            Alert.alert("오류", "댓글 삭제 중 문제가 발생했습니다.");
          }
        },
      },
    ]);
  }, []);

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#ff6a33" />;
  if (!post)
    return <Text style={{ color: "#fff" }}>게시물을 찾을 수 없습니다.</Text>;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#111" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.author}>{post.memberName}</Text>

        {post.highlightUrl?.endsWith(".mp4") ? (
          <Video
            source={{ uri: post.highlightUrl }}
            style={styles.media}
            useNativeControls
            resizeMode="cover"
          />
        ) : (
          <Image source={{ uri: post.highlightUrl }} style={styles.media} />
        )}

        <Text style={styles.content}>{post.content}</Text>
        {post.hashTag && <Text style={styles.hashTag}>{post.hashTag}</Text>}

        <Text style={styles.commentTitle}>댓글</Text>

        {commentLoading ? (
          <ActivityIndicator size="small" color="#ff6a33" style={{ marginVertical: 10 }} />
        ) : comments.length === 0 ? (
          <Text style={{ color: "#aaa", marginBottom: 10 }}>댓글이 없습니다.</Text>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => String(item.commentId)}
            renderItem={({ item }) => (
              <CommentItem item={item} onDelete={handleDeleteComment} />
            )}
            scrollEnabled={false}
          />
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* 댓글 입력창 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="하이라이트에 대한 댓글을 작성해 주세요!"
          placeholderTextColor="#888"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleAddComment}
          disabled={sending}
        >
          <Image
            source={require("../assets/images/Up_circle.png")}
            style={styles.sendIcon}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  author: { fontSize: 16, color: "#aaa", marginBottom: 12 },
  media: { width: "100%", height: 250, borderRadius: 10, marginBottom: 10 },
  content: { color: "#ddd", fontSize: 15, lineHeight: 22 },
  hashTag: { color: "#ffb400", marginTop: 10 },
  commentTitle: { color: "#ff6a33", fontSize: 18, marginTop: 20, marginBottom: 10 },
  commentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: { color: "#ffb400", fontWeight: "bold", marginBottom: 3 },
  commentContent: { color: "#fff" },
  commentDate: { color: "#aaa", fontSize: 10, marginTop: 3 },
  deleteText: { color: "#ff5555", fontSize: 12, marginLeft: 10 },

  // 댓글 입력창 스타일
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    marginBottom: 15,
    width: "90%",
    alignSelf: "center",
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
  },
  sendButton: {
    backgroundColor: "transparent",
    padding: 8,
    marginLeft: 8,
  },
  sendIcon: {
    width: 24,
    height: 24,
    tintColor: "#ff6a33",
  },
});

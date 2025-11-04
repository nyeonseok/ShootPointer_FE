// app/CommentScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import api from "./api/api";
import { useLocalSearchParams } from "expo-router";

// 댓글 아이템 컴포넌트 최적화
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

export default function CommentScreen() {
  const params = useLocalSearchParams();
  const postId = params?.postId ? String(params.postId) : null;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // 댓글 조회
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/comment/${postId}`);
      console.log("📥 댓글 조회 data:", res.data);

      if (res.data.success) {
        // 서버 데이터가 배열이면 그대로 세팅
        setComments(res.data.data || []);
      } else {
        setComments([]);
        Alert.alert("댓글 조회 실패", res.data.msg || "댓글을 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("댓글 조회 오류:", err);
      Alert.alert("오류", "댓글 조회 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
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

      console.log("✍️ 댓글 작성 응답:", res.data);

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
            console.log("🗑 댓글 삭제 응답:", res.data);

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

  // 렌더링
  const renderItem = useCallback(
    ({ item }) => <CommentItem item={item} onDelete={handleDeleteComment} />,
    [handleDeleteComment]
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#ff6a33" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.commentId)}
          contentContainerStyle={{ paddingVertical: 10 }}
          initialNumToRender={10} // 초기 렌더링 아이템 수
          maxToRenderPerBatch={10} // 한 번에 렌더링할 아이템 수
          windowSize={5} // 화면에 렌더링할 영역
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="댓글을 입력하세요..."
          placeholderTextColor="#888"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleAddComment}
          disabled={sending}
        >
          <Text style={styles.sendText}>등록</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", paddingHorizontal: 10 },
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  input: { flex: 1, color: "#fff", paddingRight: 10 },
  sendButton: { backgroundColor: "#ff6a33", padding: 8, borderRadius: 6 },
  sendText: { color: "#fff", fontWeight: "bold" },
});

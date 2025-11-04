// app/PostDetailScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Video } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import api from "./api/api";

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/post/${postId}`);
        if (res.data.success) {
          setPost(res.data.data);
        } else {
          Alert.alert("오류", "게시물을 불러오지 못했습니다.");
        }
      } catch (error) {
        console.error("단건 조회 오류:", error);
        Alert.alert("에러", "게시물 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!post) return <Text style={{ color: "#fff" }}>게시물을 찾을 수 없습니다.</Text>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      {/* 하단 여백 */}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  author: { fontSize: 16, color: "#aaa", marginBottom: 12 },
  media: { width: "100%", height: 250, borderRadius: 10, marginBottom: 10 },
  content: { color: "#ddd", fontSize: 15, lineHeight: 22 },
  hashTag: { color: "#ffb400", marginTop: 10 },
});

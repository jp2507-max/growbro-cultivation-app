import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  Bell,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Plus,
} from 'lucide-react-native';
import { Image } from 'expo-image';

import Colors from '@/constants/colors';
import { posts, feedFilters, Post } from '@/mocks/community';

function FeedPost({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postUser}>
          <Image source={{ uri: post.avatarUrl }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.timeAgo}>{post.timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MoreHorizontal size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Image source={{ uri: post.imageUrl }} style={styles.postImage} contentFit="cover" />
      <View style={styles.postLabel}>
        <Text style={styles.postLabelText}>{post.label}</Text>
      </View>

      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <Pressable onPress={() => setLiked(!liked)} style={styles.actionBtn}>
            <Heart size={22} color={liked ? '#E53935' : Colors.text} fill={liked ? '#E53935' : 'transparent'} />
            <Text style={styles.actionCount}>{liked ? post.likes + 1 : post.likes}</Text>
          </Pressable>
          <View style={styles.actionBtn}>
            <MessageCircle size={22} color={Colors.text} />
            <Text style={styles.actionCount}>{post.comments}</Text>
          </View>
          <TouchableOpacity>
            <Send size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Bookmark size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.postCaption}>
        <Text>
          <Text style={styles.captionUser}>{post.username}</Text>{' '}
          <Text style={styles.captionText}>{post.caption}</Text>
        </Text>
        <Text style={styles.hashtags}>{post.hashtags}</Text>
      </View>
    </View>
  );
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState(0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity><Search size={22} color={Colors.text} /></TouchableOpacity>
          <TouchableOpacity><Bell size={22} color={Colors.text} /></TouchableOpacity>
        </View>
      </View>

      <View style={styles.filters}>
        {feedFilters.map((f, i) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === i && styles.filterChipActive]}
            onPress={() => setActiveFilter(i)}
          >
            <Text style={[styles.filterText, activeFilter === i && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {posts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { bottom: 24 }]} testID="new-post-btn">
        <Plus size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.borderLight,
  },
  username: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  postImage: {
    width: '100%',
    height: 280,
  },
  postLabel: {
    position: 'absolute',
    bottom: 165,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  postLabelText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  postActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  postCaption: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  captionUser: {
    fontWeight: '700' as const,
    color: Colors.text,
    fontSize: 14,
  },
  captionText: {
    fontSize: 14,
    color: Colors.text,
  },
  hashtags: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '500' as const,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

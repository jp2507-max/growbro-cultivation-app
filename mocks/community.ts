export interface Post {
  id: string;
  username: string;
  timeAgo: string;
  imageUrl: string;
  caption: string;
  label: string;
  likes: number;
  comments: number;
  hashtags: string;
  avatarUrl: string;
}

export const posts: Post[] = [
  {
    id: '1',
    username: 'HydroHomie',
    timeAgo: '2h ago',
    imageUrl: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=600&h=400&fit=crop',
    caption: 'Checking the trichomes today. Thinking about chopping this weekend. What do you guys think?',
    label: 'White Widow • Week 8',
    likes: 42,
    comments: 5,
    hashtags: '#harvest #trichomes #macro',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
  },
  {
    id: '2',
    username: 'GreenThumb',
    timeAgo: '5h ago',
    imageUrl: 'https://images.unsplash.com/photo-1518568403628-df55701ade9e?w=600&h=400&fit=crop',
    caption: 'Got the new LEDs dialed in. The girls are loving the spectrum change!',
    label: 'Setup Update • Week 2 Veg',
    likes: 128,
    comments: 12,
    hashtags: '#indoorgrow #ledgrowlights #vegstage',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=80&h=80&fit=crop',
  },
];

export const feedFilters = ['Trending', 'Newest', 'Following'] as const;

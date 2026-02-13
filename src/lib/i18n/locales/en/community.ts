const community = {
  filters: {
    trending: 'Trending',
    newest: 'Newest',
    following: 'Following',
  },
  newPost: '+ Post',
  noPostsTitle: 'No Posts Yet',
  noPostsSubtitle: 'Be the first to share with the community',
  share: {
    withCaption:
      'Check out this post from {{author}} on GrowBro:\n\n"{{caption}}"',
    withoutCaption: 'Check out this post from {{author}} on GrowBro!',
  },
  createPost: {
    title: 'New Post',
    share: 'Share',
    captionPlaceholder: "What's growing on?",
    addPhoto: 'Add Photo',
    hashtagsPlaceholder: '#hashtags',
    errors: {
      mediaPermission:
        'Permission to access media library is required to add photos',
      failedPickImage: 'Failed to pick image. Please try again.',
      failedCreatePost: 'Failed to create post. Please try again.',
    },
  },
} as const;

export default community;

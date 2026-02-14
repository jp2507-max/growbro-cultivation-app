const community = {
  filters: {
    trending: 'Trending',
    newest: 'Newest',
    following: 'Following',
  },
  newPost: '+ Post',
  searchPlaceholder: 'Search posts',
  noPostsTitle: 'No Posts Yet',
  noPostsSubtitle: 'Be the first to share with the community',
  noSearchResultsTitle: 'No Results Found',
  noSearchResultsSubtitle: 'No posts matched "{{query}}"',
  unknownAuthor: 'Unknown',
  preview: {
    openComposer: 'Open composer',
  },
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
    a11y: {
      closeLabel: 'Close new post modal',
      closeHint: 'Closes the modal and returns to the community feed',
    },
    errors: {
      mediaPermission:
        'Permission to access media library is required to add photos',
      failedPickImage: 'Failed to pick image. Please try again.',
      failedCreatePost: 'Failed to create post. Please try again.',
    },
  },
} as const;

export default community;

const community = {
  filters: {
    trending: 'Beliebt',
    newest: 'Neueste',
    following: 'Folge ich',
  },
  newPost: '+ Beitrag',
  searchPlaceholder: 'Beiträge suchen',
  noPostsTitle: 'Noch keine Beiträge',
  noPostsSubtitle: 'Sei der Erste, der mit der Community teilt',
  noSearchResultsTitle: 'Keine Treffer gefunden',
  noSearchResultsSubtitle: 'Keine Beiträge für "{{query}}" gefunden',
  unknownAuthor: 'Unbekannt',
  preview: {
    openComposer: 'Editor öffnen',
  },
  share: {
    withCaption:
      'Schau dir diesen Beitrag von {{author}} auf GrowBro an:\n\n"{{caption}}"',
    withoutCaption: 'Schau dir diesen Beitrag von {{author}} auf GrowBro an!',
  },
  createPost: {
    title: 'Neuer Beitrag',
    share: 'Teilen',
    captionPlaceholder: 'Was wächst bei dir?',
    addPhoto: 'Foto hinzufügen',
    hashtagsPlaceholder: '#hashtags',
    a11y: {
      closeLabel: 'Neuer-Beitrag-Modal schließen',
      closeHint: 'Schließt das Modal und bringt dich zurück zum Community-Feed',
    },
    errors: {
      mediaPermission:
        'Zugriff auf die Mediathek ist erforderlich, um Fotos hinzuzufügen',
      failedPickImage:
        'Bild konnte nicht ausgewählt werden. Bitte erneut versuchen.',
      failedCreatePost:
        'Beitrag konnte nicht erstellt werden. Bitte erneut versuchen.',
    },
  },
} as const;

export default community;

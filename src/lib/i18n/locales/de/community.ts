export default {
  filters: {
    all: 'Alle',
    showcase: 'Showcase',
    help: 'Hilfe / Klinik',
    discussion: 'Diskussion',
    helpNeeded: 'Hilfe gesucht',
    trending: 'Beliebt',
    newest: 'Neueste',
    following: 'Folge ich',
  },
  sort: {
    label: 'Sortierung',
    trending: 'Beliebt',
    newest: 'Neueste',
  },
  actions: {
    savePost: 'Beitrag speichern',
    unsavePost: 'Gespeicherten Beitrag entfernen',
    openMenu: 'Aktionsmenü öffnen',
    reportPost: 'Beitrag melden',
    reportComment: 'Kommentar melden',
    reportUser: 'Nutzer melden',
    blockUser: 'Nutzer blockieren',
    unblockUser: 'Nutzer entsperren',
    deletePost: 'Beitrag löschen',
    copyCaption: 'Text kopieren',
    viewSaved: 'Gespeicherte Beiträge',
    viewComments: 'Kommentare anzeigen',
    viewProfile: 'Profil anzeigen',
    reply: 'Antworten',
    joinIn: 'Mitmachen',
  },
  following: {
    emptyTitle: 'Noch keine Beiträge von gefolgten Growern',
    emptySubtitle: 'Folge Growern, um ihre Beiträge hier zu sehen.',
  },
  createFirstPost: 'Ersten Beitrag erstellen',
  searchPlaceholder: 'Beiträge suchen',
  noPostsTitle: 'Noch keine Beiträge',
  noPostsSubtitle: 'Sei der Erste, der mit der Community teilt',
  noSearchResultsTitle: 'Keine Treffer gefunden',
  noSearchResultsSubtitle: 'Keine Beiträge für "{{query}}" gefunden',
  unknownAuthor: 'Unbekannt',
  preview: {
    openComposer: 'Editor öffnen',
  },
  saved: {
    title: 'Gespeicherte Beiträge',
    emptyTitle: 'Noch keine gespeicherten Beiträge',
    emptySubtitle: 'Speichere Beiträge, um sie später schnell wiederzufinden.',
  },
  comments: {
    title: 'Kommentare',
    placeholder: 'Kommentar schreiben…',
    reply: 'Antworten',
    replyingTo: 'Antwort an {{name}}',
    viewReplies: '{{count}} Antworten anzeigen',
    hideReplies: 'Antworten ausblenden',
    deleteConfirm: 'Diesen Kommentar löschen?',
    invalidPost: 'Dieser Beitrag konnte nicht geladen werden.',
    noCommentsTitle: 'Noch keine Kommentare',
    noCommentsSubtitle: 'Starte die Unterhaltung mit dem ersten Kommentar.',
  },
  report: {
    title: 'Melden',
    reporting: 'Du meldest',
    reasonTitle: 'Grund',
    detailsTitle: 'Zusätzliche Details',
    detailsPlaceholder: 'Weitere Hinweise hinzufügen (optional)',
    submit: 'Meldung senden',
    success: 'Danke — deine Meldung wurde gesendet.',
    reasons: {
      spam: 'Spam',
      inappropriate: 'Unangemessener Inhalt',
      harassment: 'Belästigung oder Hass',
      other: 'Sonstiges',
    },
    targets: {
      post: 'Beitrag',
      comment: 'Kommentar',
      user: 'Nutzer',
    },
    errors: {
      missingTarget:
        'Es konnte nicht bestimmt werden, was gemeldet werden soll.',
      submit: 'Meldung konnte nicht gesendet werden. Bitte erneut versuchen.',
    },
  },
  block: {
    confirmTitle: '{{name}} blockieren?',
    confirmDescription:
      'Du und {{name}} seht die Beiträge und Kommentare des anderen nicht mehr.',
    blocked: '{{name}} wurde blockiert.',
    unblocked: '{{name}} wurde entsperrt.',
  },
  share: {
    withCaption:
      'Schau dir diesen Beitrag von {{author}} auf GrowBro an:\n\n"{{caption}}"',
    withoutCaption: 'Schau dir diesen Beitrag von {{author}} auf GrowBro an!',
  },
  createPost: {
    title: 'Neuer Beitrag',
    share: 'Teilen',
    types: {
      title: 'Beitragstyp',
      showcaseLabel: 'Showcase',
      showcaseDescription:
        'Teile dein Setup, Pflanzenfortschritte und Ernte-Momente.',
      helpLabel: 'Hilfe / Klinik',
      helpDescription:
        'Bitte die Community um Diagnose, Tipps und Problemlösungen.',
    },
    captionPlaceholder: 'Was wächst bei dir?',
    helpCaptionPlaceholder:
      'Beschreibe dein Problem. Welche Sorte? Welche Grow-Woche? Welche Nährstoffe?',
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
  profile: {
    title: 'Grower-Profil',
    invalidUser: 'Dieses Grower-Profil konnte nicht geladen werden.',
    unknownGrower: 'Unbekannter Grower',
    follow: 'Folgen',
    unfollow: 'Entfolgen',
    editProfile: 'Profil bearbeiten',
    emptyPostsTitle: 'Noch keine Beiträge',
    emptyPostsSubtitle: 'Dieser Grower hat noch nichts geteilt.',
    blockedTitle: 'Nutzer ist blockiert',
    blockedSubtitle:
      'Während der Blockierung seht ihr die Inhalte des anderen nicht.',
    stats: {
      posts: 'Beiträge',
      followers: 'Follower',
      following: 'Folgt',
    },
  },
} as const;

import React, { memo } from 'react';

import { Text, View } from '@/src/tw';

type FeedPostCaptionProps = {
  authorName: string;
  caption: string;
  hashtags: string[];
};

export const FeedPostCaption = memo(function FeedPostCaption({
  authorName,
  caption,
  hashtags,
}: FeedPostCaptionProps): React.ReactElement {
  return (
    <View className="px-4 pb-4">
      <Text
        className="mb-1 text-sm leading-relaxed text-text dark:text-text-primary-dark"
        selectable
      >
        <Text className="font-bold text-text dark:text-text-primary-dark">
          {authorName}
        </Text>{' '}
        <Text className="text-text dark:text-text-primary-dark">{caption}</Text>
      </Text>

      {hashtags.length > 0 ? (
        <View className="mt-1.5 flex-row flex-wrap gap-1.5">
          {hashtags.map((tag) => (
            <View
              key={tag}
              className="rounded bg-primary/5 px-2 py-0.5 dark:bg-primary/10"
            >
              <Text className="text-xs font-semibold text-primary dark:text-primary-bright">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
});

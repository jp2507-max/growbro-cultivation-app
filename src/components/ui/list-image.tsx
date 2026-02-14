import React from 'react';

import { Image, type ImageProps } from '@/src/tw/image';

function isRemoteImageSource(source: ImageProps['source']): boolean {
  if (typeof source === 'string') return true;
  if (!source || typeof source !== 'object' || Array.isArray(source))
    return false;

  const sourceRecord = source as Record<string, unknown>;

  return typeof sourceRecord.uri === 'string';
}

export function ListImage({
  source,
  cachePolicy,
  priority,
  transition = 200,
  ...props
}: ImageProps): React.ReactElement {
  const isRemote = isRemoteImageSource(source);
  const resolvedCachePolicy =
    cachePolicy ?? (isRemote ? 'memory-disk' : undefined);
  const resolvedPriority = priority ?? (isRemote ? 'normal' : undefined);

  return (
    <Image
      source={source}
      cachePolicy={resolvedCachePolicy}
      priority={resolvedPriority}
      transition={transition}
      {...props}
    />
  );
}

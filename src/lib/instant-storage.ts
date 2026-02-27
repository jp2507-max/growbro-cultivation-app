import {
  ImageManipulator as ExpoImageManipulator,
  SaveFormat,
} from 'expo-image-manipulator';
import { Image as ReactNativeImage } from 'react-native';

import { db } from '@/src/lib/instant';

type UploadInstantFileInput = {
  uri: string;
  path: string;
  contentType?: string;
};

type BuildPlantPhotoPathInput = {
  ownerId: string;
  plantId: string;
  uri?: string;
  contentType?: string;
};

type BuildCommunityPostImagePathInput = {
  ownerId: string;
  postId: string;
  uri?: string;
  contentType?: string;
};

const CONTENT_TYPE_TO_EXTENSION = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
} as const;

const MAX_UPLOAD_IMAGE_EDGE = 1600;
const IMAGE_UPLOAD_QUALITY = 0.82;

function getExtensionFromUri(uri: string | undefined): string | undefined {
  if (!uri) return undefined;
  const cleanUri = uri.split('?')[0] ?? uri;
  const segments = cleanUri.split('.');
  const extension = segments[segments.length - 1]?.toLowerCase();
  if (!extension || extension.includes('/')) return undefined;
  return extension;
}

function getExtensionFromContentType(contentType: string | undefined): string {
  if (!contentType) return 'jpg';
  return (
    CONTENT_TYPE_TO_EXTENSION[
      contentType.toLowerCase() as keyof typeof CONTENT_TYPE_TO_EXTENSION
    ] ?? 'jpg'
  );
}

function inferContentType(
  uri: string,
  contentType: string | undefined
): string {
  if (contentType) return contentType;
  const extension = getExtensionFromUri(uri);
  if (!extension) return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'heic') return 'image/heic';
  if (extension === 'heif') return 'image/heif';
  return 'image/jpeg';
}

function getImageDimensions(
  uri: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    ReactNativeImage.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      reject
    );
  });
}

function normalizeStoragePath(path: string, contentType: string): string {
  const extension = getExtensionFromContentType(contentType);
  const hasKnownExtension = /\.[a-z0-9]+$/i.test(path);
  if (!hasKnownExtension) return `${path}.${extension}`;
  return path.replace(/\.[a-z0-9]+$/i, `.${extension}`);
}

function shouldOptimizeImage(contentType: string): boolean {
  return contentType.startsWith('image/');
}

async function optimizeImageForUpload(
  uri: string,
  contentType: string
): Promise<{ uri: string; contentType: string }> {
  if (!shouldOptimizeImage(contentType)) {
    return { uri, contentType };
  }

  const { width, height } = await getImageDimensions(uri);
  const maxEdge = Math.max(width, height);
  const resizeRatio =
    maxEdge > MAX_UPLOAD_IMAGE_EDGE ? MAX_UPLOAD_IMAGE_EDGE / maxEdge : 1;

  const context = ExpoImageManipulator.manipulate(uri);

  if (resizeRatio < 1) {
    context.resize({
      width: Math.round(width * resizeRatio),
      height: Math.round(height * resizeRatio),
    });
  }

  const renderedImage = await context.renderAsync();
  const optimized = await renderedImage.saveAsync({
    compress: IMAGE_UPLOAD_QUALITY,
    format: SaveFormat.JPEG,
  });

  return {
    uri: optimized.uri,
    contentType: 'image/jpeg',
  };
}

async function createUploadBlob(
  uri: string,
  fileName: string,
  contentType: string
): Promise<File | Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    const statusText = response.statusText || 'Unknown status';
    throw new Error(
      `Failed to fetch file for upload (status ${response.status}: ${statusText}) for URI: ${uri}`
    );
  }
  const blob = await response.blob();

  if (typeof File === 'undefined') return blob;

  return new File([blob], fileName, {
    type: contentType,
  });
}

export function buildPlantPhotoPath({
  ownerId,
  plantId,
  uri,
  contentType,
}: BuildPlantPhotoPathInput): string {
  const extension =
    getExtensionFromUri(uri) ?? getExtensionFromContentType(contentType);
  return `${ownerId}/plants/${plantId}/photo-${Date.now()}.${extension}`;
}

export function buildCommunityPostImagePath({
  ownerId,
  postId,
  uri,
  contentType,
}: BuildCommunityPostImagePathInput): string {
  const extension =
    getExtensionFromUri(uri) ?? getExtensionFromContentType(contentType);
  return `${ownerId}/posts/${postId}/image-${Date.now()}.${extension}`;
}

export async function uploadInstantFile({
  uri,
  path,
  contentType,
}: UploadInstantFileInput): Promise<string> {
  const inferredContentType = inferContentType(uri, contentType);
  const optimized = await optimizeImageForUpload(uri, inferredContentType);
  const resolvedContentType = inferContentType(
    optimized.uri,
    optimized.contentType
  );
  const normalizedPath = normalizeStoragePath(path, resolvedContentType);
  const fileName = normalizedPath.split('/').pop() ?? `upload-${Date.now()}`;
  const uploadBlob = await createUploadBlob(
    optimized.uri,
    fileName,
    resolvedContentType
  );

  await db.storage.uploadFile(normalizedPath, uploadBlob, {
    contentType: resolvedContentType,
  });

  let uploadedFileUrl: string | undefined;
  let retryCount = 0;
  let delayMs = 100;

  while (retryCount <= 3) {
    const { data } = await db.queryOnce({
      $files: { $: { where: { path: normalizedPath } } },
    });

    const file = data.$files[0];
    if (file?.url) {
      uploadedFileUrl = file.url;
      break;
    }

    if (retryCount < 3) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= 2;
    }
    retryCount++;
  }

  if (!uploadedFileUrl) {
    throw new Error(
      'Storage upload succeeded but file URL could not be resolved'
    );
  }

  return uploadedFileUrl;
}

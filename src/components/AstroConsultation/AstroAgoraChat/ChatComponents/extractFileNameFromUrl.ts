interface ExtractFileNameFromUrl {
  name: string;
  extension: string;
}

export function extractFileNameFromUrl(
  url: string,
): ExtractFileNameFromUrl | null {
  try {
    const cleanUrl = url?.split?.('?')?.[0]?.split?.('#')?.[0];
    const segments = cleanUrl?.split?.('/');
    const totalSegmentsLength = segments?.length;
    const fullFilename = segments[totalSegmentsLength - 2];
    const splitFullFilename = fullFilename?.split?.('.');
    const extension = splitFullFilename[splitFullFilename?.length - 1];
    const remainingElements = splitFullFilename?.slice?.(
      0,
      splitFullFilename?.length - 1,
    );
    const originalFileName = remainingElements?.join?.('');

    return {
      name: originalFileName,
      extension: extension,
    };
  } catch (error) {
    console.error('Error extracting filename:', (error as Error)?.message);
    return null;
  }
}

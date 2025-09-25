export function bytesToMegaBytes(bytes) {
  return bytes / (1024 * 1024);
}

/**
 * Converts blob to file object.
 * @param {Blob} blob
 * @param {string} fileName
 */
export async function blobToFile(blob, fileName) {
  const arrayBuffer = await blob.arrayBuffer();
  return new File([arrayBuffer], fileName, {type: blob.type});
}

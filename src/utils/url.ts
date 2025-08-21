/**
 * Test if a string is a valid URL
 * @param url a potential url.
 * @returns true if the url is valid, false otherwise.
 */
export function testUrl(url: any): boolean {
  if (typeof url !== 'string') {
    return false;
  }

  if (!url || url.trim() === '') {
    return false;
  }
  let result: URL;
  try {
    result = new URL(url);
  } catch {
    return false;
  }

  return (
    result.protocol.trim() !== '' &&
    (result.protocol === 'http:' || result.protocol === 'https:')
  );
}

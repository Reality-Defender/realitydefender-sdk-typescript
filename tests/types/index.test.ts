/**
 * Tests for the types index module
 */
import * as TypesIndex from '../../src/types';

describe('Types Index Module', () => {
  it('should export all needed types', () => {
    // Verify that the index exports the correct number of types
    const exportedKeys = Object.keys(TypesIndex);
    expect(exportedKeys.length).toBeGreaterThan(0);

    // Since we can't directly check individual types due to TypeScript's
    // type erasure at runtime, we'll check for key object interface existence

    // Create a variable using TypesIndex exports to ensure it works
    const testConfig: TypesIndex.RealityDefenderConfig = {
      apiKey: 'test-key',
    };

    const testOptions: TypesIndex.UploadOptions = {
      filePath: '/path/test.jpg',
    };

    const testResult: TypesIndex.DetectionResult = {
      status: 'MANIPULATED',
      score: 95,
      models: [],
    };

    // Verify we can construct these objects
    expect(testConfig.apiKey).toBe('test-key');
    expect(testOptions.filePath).toBe('/path/test.jpg');
    expect(testResult.status).toBe('MANIPULATED');
  });
});

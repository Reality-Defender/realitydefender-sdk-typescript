# Reality Defender SDK for TypeScript
[![codecov](https://codecov.io/gh/Reality-Defender/realitydefender-sdk-typescript/graph/badge.svg?token=VP4OMK4708)](https://codecov.io/gh/Reality-Defender/realitydefender-sdk-typescript)

A TypeScript SDK for the Reality Defender API to detect deepfakes and manipulated media.

## Installation

```bash
# Using yarn
yarn add @realitydefender/realitydefender

# Using npm
npm install @realitydefender/realitydefender
```

## Getting Started

First, you need to obtain an API key from the [Reality Defender Platform](https://app.realitydefender.ai).

To generate an API key:
1. Log in to your account on the [Reality Defender Platform](https://app.realitydefender.ai)
2. Click on your profile icon and select "Settings" from the dropdown menu
3. Look for the `API Keys` option
4. Click on `Add API Key`

### Quick Start

The simplest way to detect manipulated media is to use the `detect` method, which handles both upload and analysis in a single call:

```typescript
import { RealityDefender } from '@realitydefender/realitydefender';

// Initialize the SDK with your API key
const realityDefender = new RealityDefender({
  apiKey: 'your-api-key',
});

async function detectMedia() {
  try {
    // Upload and analyze in one step
    const result = await realityDefender.detect({
      filePath: '/path/to/your/file.jpg',
    });
    
    // Process the results
    console.log(`Status: ${result.status}`);
    console.log(`Score: ${result.score}`); // Score is a value between 0 and 1

    
    return result;
  } catch (error: any) {
    console.error(`Error: ${error.message} (${error.code})`);
    throw error;
  }
}

// Call the function
detectMedia()
  .then(result => console.log('Detection completed successfully'))
  .catch(error => console.error('Detection failed'));
```

### Two-Step Upload and Analysis Approach

This two-step approach (separate upload and getResult calls) gives you more control over the process and allows you to store the requestId for later retrieval, which is useful for implementing progress tracking or resuming analysis in long-running applications:

```typescript
import { RealityDefender } from '@realitydefender/realitydefender';

// Initialize the SDK with your API key
const realityDefender = new RealityDefender({
  apiKey: 'your-api-key',
});

async function detectMedia() {
  try {
    // Upload a file for analysis
    const { requestId } = await realityDefender.upload({
      filePath: '/path/to/your/file.jpg',
    });
    
    //Await results using the requestId
    const result = await realityDefender.getResult(requestId);
    
    // Process the results
    console.log(`Status: ${result.status}`);
    console.log(`Score: ${result.score}`); // Score is a value between 0 and 1
    
    // List model results
    result.models.forEach(model => {
      console.log(`${model.name}: ${model.status} (${model.score})`); // Model scores are also between 0 and 1
    });
    
    return result;
  } catch (error: any) {
    console.error(`Error: ${error.message} (${error.code})`);
    throw error;
  }
}

// Call the function
detectMedia()
  .then(result => console.log('Detection completed successfully'))
  .catch(error => console.error('Detection failed'));
```

### Event-driven approach
The event-driven approach is preferable in scenarios where you need to handle long-running operations without blocking the main thread.
Here's how to implement an event-driven approach:

```typescript
import { RealityDefender } from '@realitydefender/realitydefender';

async function detectMedia() {
  // Initialize the SDK with your API key
  const realityDefender = new RealityDefender({
    apiKey: 'your-api-key'
  });

  // Upload a file for analysis
  const {requestId} = await realityDefender.upload({
    filePath: '/path/to/your/file.jpg',
  });

  // Start polling
  realityDefender.pollForResults(requestId, {
    pollingInterval: 3000,
    timeout: 60000
  });

  // Event-based approach to get results
  realityDefender.on('result', (result) => {
    console.log(`Status: ${result.status}`);
    console.log(`Score: ${result.score}`); // Score is a value between 0 and 1

    // List model results
    result.models.forEach(model => {
      console.log(`${model.name}: ${model.status} (${model.score})`); // Model scores are also between 0 and 1
    });
  });

  realityDefender.on('error', (error) => {
    console.error(`Error: ${error.message} (${error.code})`);
  });
}

// Call the function
detectMedia()
  .then(result => console.log('Waiting for result'))
  .catch(error => console.error('Detection failed'));
```


## Architecture

The SDK is designed with a modular architecture for better maintainability and testability:

- **Client Layer**: HTTP communication with the Reality Defender API
- **Core**: Configuration, constants, and event handling
- **Detection**: Media upload and results processing
- **Types**: Type definitions for API responses and SDK interfaces
- **Utils**: File operations and helper functions

## API Reference

### Initialize the SDK

```typescript
const realityDefender = new RealityDefender({
  apiKey: string,       // Required: Your API key
  baseUrl?: string      // Optional: Custom API base URL
});
```


### Detect Media (Upload and Analyze in One Step)

```typescript
const result = await realityDefender.detect({
  filePath: string,                 // Required: Path to the file to analyze
}, {
  maxAttempts?: number,             // Optional: Maximum polling attempts
  pollingInterval?: number          // Optional: Interval in ms to poll for results (default: 5000)
});
```

### Upload Media for Analysis

```typescript
const result = await realityDefender.upload({
  filePath: string,                 // Required: Path to the file to analyze
  pollingInterval?: number,         // Optional: Interval in ms to poll for results (default: 5000)
  timeout?: number                  // Optional: Timeout in ms for polling (default: 300000)
});
```

Returns: `{ requestId: string, mediaId: string }`

### Get Results for a Request

```typescript
const result = await realityDefender.getResult(requestId);
```

Returns a `DetectionResult` object:

```typescript
{
  status: string,       // Overall status (e.g., "MANIPULATED", "AUTHENTIC", etc.)
  score: number,        // Overall confidence score (0-1 range, null if processing)
  models: [             // Array of model-specific results (DEPRECATED: individual model scores will no longer be returned in the future)
    {
      name: string,     // Model name
      status: string,   // Model-specific status
      score: number     // Model-specific score (0-1 range, null if not available)
    }
    
  ]
}
```

Returns the same `DetectionResult` object as `getResult()`.

### Events

The SDK extends `EventEmitter` and emits the following events:

- `'result'`: Emitted when results are available during polling
- `'error'`: Emitted when an error occurs during polling

## Error Handling

The SDK throws `RealityDefenderError` for various error scenarios:

```typescript
try {
  const result = await realityDefender.upload({ filePath: '/path/to/file.jpg' });
} catch (error) {
  if (error instanceof RealityDefenderError) {
    console.error(`Error: ${error.message} (${error.code})`);
    // Error codes: 'unauthorized', 'server_error', 'timeout', 
    // 'invalid_file', 'upload_failed', 'not_found', 'unknown_error'
  }
}
```

## Supported file types and size limits

There is a size limit for each of the supported file types.

| File Type | Extensions                                 | Size Limit (bytes) | Size Limit (MB) |
|-----------|--------------------------------------------|--------------------|-----------------|
| Video     | .mp4, .mov                                 | 262,144,000        | 250 MB          |
| Image     | .jpg, .png, .jpeg, .gif, .webp             | 52,428,800         | 50 MB           |
| Audio     | .flac, .wav, .mp3, .m4a, .aac, .alac, .ogg | 20,971,520         | 20 MB           |
| Text      | .txt                                       | 5,242,880          | 5 MB            |


## Supported social media platforms

The Reality Defender API supports analysis of media from the following social media platforms:
* Facebook
* Instagram
* Twitter
* YouTube
* TikTok

## Running Examples

To run the example code in this SDK, follow these steps:
1. Clone the repository:
   ```bash
   git clone https://github.com/Reality-Defender/realitydefender-sdk-typescript.git
   cd realitydefender-sdk-typescript
   ```

2. Add a sample file to test with:
   ```bash
   # Copy an image file to the examples directory
   cp /path/to/your/image.jpg examples/sample-image.jpg
   ```
   Note: You can use any common image, video, audio, text file, or other supported media formats. The example will look for a file named `sample-image.jpg` in the examples directory.

3. Set your API key and run the example:
    ```bash
    # Navigate to the typescript directory
    cd examples

    # Install dependencies
    yarn install

    export REALITY_DEFENDER_API_KEY='<your-api-key>' 
    yarn example:basic
    yarn example:getresults
    yarn example:social_media
    ```

The example code demonstrates how to upload a sample image and process the detection results.

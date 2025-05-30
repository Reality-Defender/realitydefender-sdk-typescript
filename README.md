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


### Async/Await Approach

As an alternative to the event-based approach, you can use async/await with polling:

```typescript
import { RealityDefender } from 'realitydefender';

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
    console.log(`Score: ${result.score}`);
    
    // List model results
    result.models.forEach(model => {
      console.log(`${model.name}: ${model.status} (${model.score})`);
    });
    
    return result;
  } catch (error) {
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

```typescript
import { RealityDefender } from 'realitydefender';

// Initialize the SDK with your API key
const realityDefender = new RealityDefender({
  apiKey: 'your-api-key',
  // Optional: custom base URL if needed
  // baseUrl: 'https://api.dev.realitydefender.xyz'
});

// Upload a file for analysis
const { requestId } = await realityDefender.upload({
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
  console.log(`Score: ${result.score}`);
  
  // List model results
  result.models.forEach(model => {
    console.log(`${model.name}: ${model.status} (${model.score})`);
  });
});

realityDefender.on('error', (error) => {
  console.error(`Error: ${error.message} (${error.code})`);
});
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
  status: string,       // Overall status (e.g., "ARTIFICIAL", "AUTHENTIC", etc.)
  score: number,        // Overall confidence score (0-100)
  models: [             // Array of model-specific results
    {
      name: string,     // Model name
      status: string,   // Model-specific status
      score: number     // Model-specific score
    }
  ]
}
```

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

## Advanced Usage

If you need more control, you can directly use some of the internal modules:

```typescript
import { createHttpClient } from 'reality-defender-sdk/dist/client';
import { uploadFile } from 'reality-defender-sdk/dist/detection/upload';
import { getDetectionResult } from 'reality-defender-sdk/dist/detection/results';

// Create an HTTP client
const client = createHttpClient({ apiKey: 'your-api-key' });

// Upload a file
const { requestId } = await uploadFile(client, { filePath: '/path/to/file.jpg' });

// Get results
const results = await getDetectionResult(client, requestId);
```

## Examples

See the `examples` directory for more detailed usage examples.

## Running Examples

To run the example code in this SDK, follow these steps:


```bash
# Navigate to the typescript directory
cd typescript

# Install dependencies
yarn install

# Build the SDK
yarn build

# Navigate to examples directory and install dependencies
cd examples
yarn install

# Navigate back and run the example
cd ..
export REALITY_DEFENDER_API_KEY='<your-api-key>' 
yarn example
```

The example code demonstrates how to upload a sample image and process the detection results.

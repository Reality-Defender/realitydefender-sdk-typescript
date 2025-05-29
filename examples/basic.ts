import { RealityDefender, RealityDefenderError, DetectionResult } from 'realitydefender';
import path from 'path';
import fs from 'fs';

// Replace with your API key
const API_KEY = process.env.REALITY_DEFENDER_API_KEY || 'your-api-key-here';

// Initialize the SDK
const realityDefender = new RealityDefender({
  apiKey: API_KEY,
  // Use this for development environments
  // baseUrl: 'https://api.dev.realitydefender.xyz'
});

// Path to the file you want to analyze
// Use an absolute path for the example
const filePath = path.resolve(process.cwd(), './examples/sample-image.jpg');

// Create a sample image if it doesn't exist
if (!fs.existsSync(filePath)) {
  const sampleDir = path.dirname(filePath);
  if (!fs.existsSync(sampleDir)) {
    fs.mkdirSync(sampleDir, { recursive: true });
  }
  
  // Create an empty file for demonstration
  fs.writeFileSync(filePath, Buffer.from(''));
  console.log(`Created sample file at ${filePath}`);
}

/**
 * Example 1: Polling-based approach with event listeners
 */
async function analyzeMediaWithPolling() {
  try {
    console.log('--- EXAMPLE 1: POLLING-BASED APPROACH ---');
    console.log(`Uploading file: ${filePath}`);
    
    // Upload the file for analysis
    const { requestId } = await realityDefender.upload({
      filePath
    });
    
    console.log(`Upload successful. Request ID: ${requestId}`);
    console.log('Waiting for analysis results...');
    
    // Start event-based polling
    realityDefender.pollForResults(requestId, {
      pollingInterval: 3000,
      timeout: 60000
    });
    
    // Listen for results
    realityDefender.on('result', (result) => {
      console.log('Analysis complete!');
      console.log(`Status: ${result.status}`);
      console.log(`Score: ${result.score !== null ? result.score : 'N/A'}`);
      console.log('Model results:');
      
      result.models.forEach(model => {
        console.log(`- ${model.name}: ${model.status} (${model.score !== null ? model.score : 'N/A'})`);
      });
    });
    
    realityDefender.on('error', (error: RealityDefenderError) => {
      console.error(`Error during analysis: ${error.message} (${error.code})`);
    });
  } catch (error) {
    console.error(`Error during analysis: ${error}`);
  }
}

/**
 * Example 2: Promise-based approach
 */
async function analyzeMediaWithPromise() {
  try {
    console.log('--- EXAMPLE 2: PROMISE-BASED APPROACH ---');
    console.log(`Uploading file: ${filePath}`);
    
    // Upload the file for analysis
    const { requestId } = await realityDefender.upload({
      filePath
    });
    
    console.log(`Upload successful. Request ID: ${requestId}`);
    console.log('Waiting for analysis results...');
    
    // Get the result using promise-based API
    const result = await realityDefender.getResult(requestId, {
      maxAttempts: Number.MAX_SAFE_INTEGER,
      pollingInterval: 3000
    });
    
    console.log('Analysis complete!');
    console.log(`Status: ${result.status}`);
    console.log(`Score: ${result.score !== null ? result.score : 'N/A'}`);
    console.log('Model results:');
    
    result.models.forEach(model => {
      console.log(`- ${model.name}: ${model.status} (${model.score !== null ? model.score : 'N/A'})`);
    });
  } catch (error) {
    if (error instanceof RealityDefenderError) {
      console.error(`Error during analysis: ${error.message} (${error.code})`);
    } else {
      console.error(`Error during analysis: ${error}`);
    }
  }
}

// Run the selected example based on user input
async function runExamples() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('Which example would you like to run?');
  console.log('1) Polling-based approach (event listeners)');
  console.log('2) Promise-based approach');
  
  const answer = await new Promise<string>(resolve => {
    rl.question('Enter 1 or 2: ', resolve);
  });
  
  rl.close();
  
  switch(answer.trim()) {
    case '1':
      await analyzeMediaWithPolling();
      break;
    case '2':
      await analyzeMediaWithPromise();
      break;
    default:
      console.log('Invalid option. Please run again and enter 1 or 2.');
  }
}

runExamples(); 
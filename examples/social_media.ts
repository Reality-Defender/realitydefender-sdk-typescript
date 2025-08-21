/**
 * Example: Social Media Link Analysis
 *
 * This example demonstrates how to analyze a social media post using the Reality Defender SDK.
 * It shows how to upload a social media link for analysis and retrieve the results.
 */

import { RealityDefender, RealityDefenderError, DetectionResult } from '../src';

// Get API key from environment variable or replace with your actual API key
const API_KEY = process.env.REALITY_DEFENDER_API_KEY || 'your-api-key-here';

async function analyzeSocialMediaPost() {
  let rd: RealityDefender;
  try {
    // Initialize the Reality Defender SDK
    rd = new RealityDefender({
      apiKey: API_KEY,
    });
  } catch (error) {
    if (error instanceof RealityDefenderError) {
      console.error('❌ Error initializing SDK:', error.message);
      console.error('Error code:', error.code);
    } else {
      console.error('❌ Unexpected error:', error);
    }
    return;
  }

  console.log('🔍 Starting social media analysis...\n');

  // Example social media links to analyze
  const socialMediaLinks = [
    'https://www.youtube.com/watch?v=6O0fySNw-Lw',
    'https://youtube.com/watch?v=ABC123',
  ];

  for (const socialLink of socialMediaLinks) {
    console.log(`📱 Analyzing social media post: ${socialLink}`);

    try {
      // Upload the social media link for analysis
      const uploadResult = await rd.uploadSocialMedia({
        socialLink: socialLink,
      });

      console.log(`✅ Upload successful! Request ID: ${uploadResult.requestId}`);

      // Get the analysis results
      console.log('⏳ Waiting for analysis to complete...');
      const result: DetectionResult = await rd.getResult(uploadResult.requestId, {
        maxAttempts: 12, // Wait up to 60 seconds (12 attempts * 5 seconds)
        pollingInterval: 5000, // Check every 5 seconds
      });

      // Display the results
      console.log('\n📊 Analysis Results:');
      console.log(`Status: ${result.status}`);
      console.log(
        `Confidence Score: ${result.score ? (result.score * 100).toFixed(2) + '%' : 'N/A'}`
      );

      if (result.models && result.models.length > 0) {
        console.log('\n🤖 Individual Model Results:');
        result.models.forEach(model => {
          const modelScore = model.score ? (model.score * 100).toFixed(2) + '%' : 'N/A';
          console.log(`  - ${model.name}: ${model.status} (${modelScore})`);
        });
      }

      console.log('\n' + '='.repeat(50) + '\n');
    } catch (error) {
      if (error instanceof RealityDefenderError) {
        console.error(`❌ Error analyzing ${socialLink}:`, error.message);
        console.error(`Error code: ${error.code}`);
      } else {
        console.error(`❌ Unexpected error analyzing ${socialLink}:`, error);
      }
      console.log('\n' + '='.repeat(50) + '\n');
    }
  }
}

// Run the examples
async function main() {
  console.log('🚀 Reality Defender Social Media Analysis Examples\n');

  // Check if API key is provided
  if (API_KEY === 'your-api-key-here') {
    console.log(
      '⚠️  Please set your REALITY_DEFENDER_API_KEY environment variable or update the API_KEY constant in this file.'
    );
    console.log('   Example: export REALITY_DEFENDER_API_KEY="your-actual-api-key"\n');
    return;
  }

  // Run basic analysis
  await analyzeSocialMediaPost();

  console.log('✨ Examples completed!');
}

// Execute the main function
if (require.main === module) {
  main().catch(console.error);
}

export { analyzeSocialMediaPost };

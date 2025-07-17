import { RealityDefender } from '@realitydefender/realitydefender';

/**
 * Example: List Detection Results
 *
 * This example demonstrates how to retrieve and paginate through
 * detection results using the getResults method.
 */

async function listAllResults() {
  console.log('=== Listing All Detection Results ===');

  const sdk = new RealityDefender({
    apiKey: process.env.REALITY_DEFENDER_API_KEY!,
  });

  try {
    // Get first page of results
    const results = await sdk.getResults(0, 10);

    console.log(`Found ${results.totalItems} total results`);
    console.log(
      `Showing page ${results.currentPage + 1} (${results.currentPageItemsCount} items):`
    );

    results.items.forEach(result => {
      console.log(`   Status: ${result.status}`);
      console.log(`   Score: ${result.score}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error listing results:', error);
  }
}

async function listRecentResults() {
  console.log('=== Listing Recent Detection Results ===');

  const sdk = new RealityDefender({
    apiKey: process.env.REALITY_DEFENDER_API_KEY!,
  });

  try {
    // Get results from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const results = await sdk.getResults(0, 20, null, sevenDaysAgo, null);

    console.log(`Found ${results.totalItems} results from the last 7 days:`);

    results.items.forEach(result => {
      console.log(`   Status: ${result.status}`);
      console.log(`   Score: ${result.score}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error listing recent results:', error);
  }
}

async function paginateResults() {
  console.log('=== Paginating Through Results ===');

  const sdk = new RealityDefender({
    apiKey: process.env.REALITY_DEFENDER_API_KEY!,
  });

  try {
    const pageSize = 5;
    let pageNumber = 0;
    let totalSeen = 0;

    while (true) {
      const results = await sdk.getResults(pageNumber, pageSize);

      if (results.currentPageItemsCount === 0) {
        console.log('No more results.');
        break;
      }

      console.log(`\nPage ${pageNumber + 1} of results:`);

      results.items.forEach(result => {
        totalSeen++;
        console.log(`${totalSeen}. Status: ${result.status} - Score: ${result.score}`);
      });

      pageNumber++;

      // Stop after showing 3 pages for demo purposes
      if (pageNumber >= 3) {
        console.log(
          `\nShowing first 3 pages only (${totalSeen} of ${results.totalItems} total results)`
        );
        break;
      }
    }
  } catch (error) {
    console.error('Error paginating results:', error);
  }
}

async function runExamples() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('Which results example would you like to run?');
  console.log('1) List all results (first page)');
  console.log('2) List recent results (last 7 days)');
  console.log('3) Paginate through results');

  const answer = await new Promise<string>(resolve => {
    rl.question('Enter 1, 2, or 3: ', resolve);
  });

  rl.close();

  switch (answer.trim()) {
    case '1':
      await listAllResults();
      break;
    case '2':
      await listRecentResults();
      break;
    case '3':
      await paginateResults();
      break;
    default:
      console.log('Invalid option. Please run again and enter 1, 2, or 3.');
  }
}

// Check if API key is set
if (!process.env.REALITY_DEFENDER_API_KEY) {
  console.error('Please set the REALITY_DEFENDER_API_KEY environment variable');
  process.exit(1);
}

runExamples().catch(console.error);

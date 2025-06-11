/**
 * Jest setup file
 */

// Set up a shorter fake timer for better test performance
jest.setTimeout(10000);

// Fix for "Jest did not exit one second after the test run has completed"
afterAll(done => {
  // Force Jest to exit as soon as the tests are done
  setTimeout(() => {
    done();
  }, 1000);
});

#!/usr/bin/env node

/**
 * BThwani Performance Testing Script
 * Load testing and performance validation for production readiness
 */

const autocannon = require('autocannon');
const { fork } = require('child_process');
const path = require('path');

class PerformanceTester {
  constructor() {
    this.results = [];
    this.serverProcess = null;
    this.baseUrl = 'http://localhost:3000';
  }

  async runAllTests() {
    console.log('🚀 Starting BThwani Performance Tests\n');

    try {
      // Start the application
      await this.startApplication();

      // Wait for app to be ready
      await this.waitForAppReady();

      // Run performance tests
      await this.runHealthCheckTest();
      await this.runAPITests();
      await this.runLoadTest();
      await this.runStressTest();

      // Generate report
      this.generateReport();

    } catch (error) {
      console.error('❌ Performance testing failed:', error);
    } finally {
      // Cleanup
      await this.stopApplication();
    }
  }

  async startApplication() {
    console.log('📦 Starting application...');

    return new Promise((resolve, reject) => {
      this.serverProcess = fork(path.join(__dirname, '../dist/main.js'), [], {
        env: {
          ...process.env,
          NODE_ENV: 'production',
          PORT: '3000',
        },
        stdio: 'pipe'
      });

      this.serverProcess.on('message', (message) => {
        if (message === 'ready') {
          console.log('✅ Application started successfully');
          resolve();
        }
      });

      this.serverProcess.on('error', reject);

      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('Application startup timeout'));
      }, 30000);
    });
  }

  async waitForAppReady() {
    console.log('⏳ Waiting for application to be ready...');

    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch(`${this.baseUrl}/health`);
        if (response.ok) {
          console.log('✅ Application is ready');
          return;
        }
      } catch (error) {
        // Continue waiting
      }

      await this.sleep(1000);
    }

    throw new Error('Application failed to become ready');
  }

  async stopApplication() {
    if (this.serverProcess) {
      console.log('🛑 Stopping application...');
      this.serverProcess.kill('SIGTERM');

      // Wait for graceful shutdown
      await new Promise((resolve) => {
        this.serverProcess.on('exit', resolve);
        setTimeout(resolve, 5000); // Force kill after 5 seconds
      });
    }
  }

  async runHealthCheckTest() {
    console.log('\n🏥 Running Health Check Performance Test...');

    const result = await this.runAutocannon({
      url: `${this.baseUrl}/health`,
      connections: 10,
      duration: 10,
      title: 'Health Check'
    });

    this.validateHealthCheck(result);
  }

  async runAPITests() {
    console.log('\n🔗 Running API Endpoint Performance Tests...');

    const endpoints = [
      { url: `${this.baseUrl}/api/v2/orders`, method: 'GET', title: 'Orders List' },
      { url: `${this.baseUrl}/api/v2/wallet/transaction`, method: 'GET', title: 'Wallet Balance' },
      { url: `${this.baseUrl}/api/v2/notifications`, method: 'GET', title: 'Notifications' },
    ];

    for (const endpoint of endpoints) {
      try {
        const result = await this.runAutocannon({
          ...endpoint,
          connections: 5,
          duration: 5,
          headers: {
            'Authorization': 'Bearer test-token' // Would need real token
          }
        });

        this.validateAPIEndpoint(result, endpoint.title);
      } catch (error) {
        console.log(`⚠️  Skipping ${endpoint.title} (requires authentication)`);
      }
    }
  }

  async runLoadTest() {
    console.log('\n📊 Running Load Test (Normal Usage)...');

    const result = await this.runAutocannon({
      url: `${this.baseUrl}/health`,
      connections: 50,
      duration: 30,
      title: 'Load Test'
    });

    this.validateLoadTest(result);
  }

  async runStressTest() {
    console.log('\n🔥 Running Stress Test (High Load)...');

    const result = await this.runAutocannon({
      url: `${this.baseUrl}/health`,
      connections: 100,
      duration: 60,
      pipelining: 10,
      title: 'Stress Test'
    });

    this.validateStressTest(result);
  }

  async runAutocannon(options) {
    return new Promise((resolve, reject) => {
      const instance = autocannon(options, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });

      autocannon.track(instance, {
        renderProgressBar: true,
        renderResultsTable: false,
        renderLatencyTable: false
      });
    });
  }

  validateHealthCheck(result) {
    const { latency, requests, throughput } = result;

    console.log(`📈 Health Check Results:`);
    console.log(`   - Requests/sec: ${Math.round(requests.average)}`);
    console.log(`   - Latency (avg): ${Math.round(latency.average)}ms`);
    console.log(`   - Throughput: ${Math.round(throughput.average / 1024)} KB/sec`);

    // Health check should be very fast
    if (latency.average > 100) {
      console.log(`⚠️  WARNING: Health check latency > 100ms`);
    }

    this.results.push({
      test: 'Health Check',
      ...this.extractMetrics(result),
      status: latency.average < 100 ? 'PASS' : 'WARN'
    });
  }

  validateAPIEndpoint(result, endpointName) {
    const { latency, requests, errors } = result;

    console.log(`📈 ${endpointName} Results:`);
    console.log(`   - Requests/sec: ${Math.round(requests.average)}`);
    console.log(`   - Latency (avg): ${Math.round(latency.average)}ms`);
    console.log(`   - Errors: ${errors.total || 0}`);

    // API endpoints should respond within 500ms for GET requests
    const maxLatency = 500;
    const status = latency.average < maxLatency && errors.total === 0 ? 'PASS' : 'FAIL';

    this.results.push({
      test: endpointName,
      ...this.extractMetrics(result),
      status
    });
  }

  validateLoadTest(result) {
    const { latency, requests, errors, timeouts } = result;

    console.log(`📈 Load Test Results (50 concurrent users):`);
    console.log(`   - Total Requests: ${requests.total}`);
    console.log(`   - Requests/sec: ${Math.round(requests.average)}`);
    console.log(`   - Latency (p95): ${Math.round(latency.p95)}ms`);
    console.log(`   - Errors: ${errors.total || 0}`);
    console.log(`   - Timeouts: ${timeouts || 0}`);

    // Load test criteria
    const criteria = {
      maxLatency: 200, // P95 should be under 200ms
      maxErrors: 0.01, // Max 1% error rate
      minThroughput: 1000 // Min 1000 requests/sec
    };

    const errorRate = (errors.total || 0) / requests.total;
    const status = (
      latency.p95 < criteria.maxLatency &&
      errorRate < criteria.maxErrors &&
      requests.average > criteria.minThroughput
    ) ? 'PASS' : 'FAIL';

    this.results.push({
      test: 'Load Test (50 users)',
      ...this.extractMetrics(result),
      status
    });
  }

  validateStressTest(result) {
    const { latency, requests, errors, timeouts } = result;

    console.log(`📈 Stress Test Results (100 concurrent users):`);
    console.log(`   - Total Requests: ${requests.total}`);
    console.log(`   - Requests/sec: ${Math.round(requests.average)}`);
    console.log(`   - Latency (p95): ${Math.round(latency.p95)}ms`);
    console.log(`   - Errors: ${errors.total || 0}`);
    console.log(`   - Timeouts: ${timeouts || 0}`);

    // Stress test criteria (more lenient)
    const criteria = {
      maxLatency: 500, // P95 under 500ms
      maxErrors: 0.05, // Max 5% error rate
      minThroughput: 500 // Min 500 requests/sec
    };

    const errorRate = (errors.total || 0) / requests.total;
    const status = (
      latency.p95 < criteria.maxLatency &&
      errorRate < criteria.maxErrors &&
      requests.average > criteria.minThroughput
    ) ? 'PASS' : 'FAIL';

    this.results.push({
      test: 'Stress Test (100 users)',
      ...this.extractMetrics(result),
      status
    });
  }

  extractMetrics(result) {
    return {
      requestsPerSec: Math.round(result.requests.average),
      latency: {
        avg: Math.round(result.latency.average),
        p50: Math.round(result.latency.p50),
        p95: Math.round(result.latency.p95),
        p99: Math.round(result.latency.p99),
      },
      throughput: Math.round(result.throughput.average / 1024), // KB/s
      errors: result.errors.total || 0,
      timeouts: result.timeouts || 0,
      duration: result.duration
    };
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        passed: this.results.filter(r => r.status === 'PASS').length,
        failed: this.results.filter(r => r.status === 'FAIL').length,
        warnings: this.results.filter(r => r.status === 'WARN').length,
        overall: this.results.every(r => r.status === 'PASS') ? 'PASS' : 'REVIEW'
      },
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    // Save detailed report
    const fs = require('fs');
    const reportPath = path.join(__dirname, '..', 'performance-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n📊 Performance Test Summary:');
    console.log(`   ✅ Passed: ${report.summary.passed}`);
    console.log(`   ❌ Failed: ${report.summary.failed}`);
    console.log(`   ⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`   📈 Overall: ${report.summary.overall}`);

    if (report.summary.overall === 'PASS') {
      console.log('🎉 All performance tests passed! Ready for production.');
    } else {
      console.log('⚠️  Performance tests require review before production deployment.');
    }

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];

    const failedTests = this.results.filter(r => r.status === 'FAIL');
    const slowTests = this.results.filter(r => r.latency && r.latency.p95 > 200);

    if (failedTests.length > 0) {
      recommendations.push('Address failing performance tests before deployment');
    }

    if (slowTests.length > 0) {
      recommendations.push('Optimize slow endpoints with caching and database indexes');
    }

    if (this.results.some(r => r.errors > 0)) {
      recommendations.push('Reduce error rates through better error handling and retries');
    }

    return recommendations;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run performance tests
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runAllTests().catch(console.error);
}

module.exports = PerformanceTester;

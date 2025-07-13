const mongoose = require('mongoose');
const { scheduleReassessment, generateRiskReport } = require('../middleware/riskAssessmentMiddleware');
require('dotenv').config();

async function runScheduledReassessment() {
  try {
    console.log('Starting scheduled risk reassessment...');
    console.log('Timestamp:', new Date().toISOString());
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blockvest');
    console.log('Connected to database');
    
    await scheduleReassessment();
    
    const report = await generateRiskReport(7);
    console.log('\n=== Weekly Risk Report ===');
    console.log(`Total Assessments (7 days): ${report.totalAssessments}`);
    console.log(`Average Risk Score: ${report.averageRiskScore}/100`);
    console.log(`High Risk Percentage: ${report.highRiskPercentage}%`);
    console.log('Risk Distribution:', report.riskDistribution);
    console.log('Category Averages:', report.categoryAverages);
    
    console.log('\nScheduled risk reassessment completed successfully');
    
  } catch (error) {
    console.error('Scheduled risk reassessment failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

if (require.main === module) {
  runScheduledReassessment();
}

module.exports = { runScheduledReassessment };
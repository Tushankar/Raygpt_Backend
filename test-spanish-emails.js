import { scheduleThreeEmailSequence } from './services/automationEmailService.js';
import { sendFirstEmail, scheduleRemainingEmails } from './services/emailService.js';

// Test Spanish email functionality
async function testSpanishEmails() {
  console.log('🧪 Testing Spanish email functionality...');
  
  try {
    // Test Spanish automation emails
    console.log('\n📧 Testing Spanish automation emails...');
    const automationResult = await scheduleThreeEmailSequence({
      email: 'test@example.com',
      name: 'María García',
      bookingLink: 'https://calendly.com/test',
      leadId: 'test-lead-123',
      language: 'es'
    }, { testMode: true });
    
    console.log('✅ Spanish automation emails scheduled:', automationResult);
    
    // Test Spanish subscription emails
    console.log('\n📧 Testing Spanish subscription emails...');
    const firstEmailResult = await sendFirstEmail({
      email: 'test@example.com',
      name: 'Carlos Rodriguez',
      language: 'es'
    });
    
    console.log('✅ Spanish first email sent:', firstEmailResult);
    
    // Test remaining Spanish emails
    const remainingEmailsResult = await scheduleRemainingEmails({
      email: 'test@example.com',
      name: 'Ana López',
      language: 'es'
    }, { testMode: true });
    
    console.log('✅ Spanish remaining emails scheduled:', remainingEmailsResult);
    
    console.log('\n🎉 All Spanish email tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Spanish email test failed:', error);
  }
}

// Run the test
testSpanishEmails();
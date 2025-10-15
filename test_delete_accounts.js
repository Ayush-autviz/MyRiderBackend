const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000'; // Adjust port as needed
const TEST_USER_PHONE = '+27790671168'; // Test phone number
const TEST_DRIVER_PHONE = '+27790671169'; // Test driver phone number

// Test user account deletion
async function testDeleteUserAccount() {
  try {
    console.log('Testing User Account Deletion...');
    
    const response = await axios.delete(`${BASE_URL}/auth/delete-account`, {
      data: {
        phone: TEST_USER_PHONE
      }
    });
    
    console.log('✅ User account deleted successfully:', response.data);
    return true;
  } catch (error) {
    if (error.response) {
      console.log('❌ User account deletion failed:', error.response.data);
    } else {
      console.log('❌ User account deletion failed:', error.message);
    }
    return false;
  }
}

// Test driver account deletion
async function testDeleteDriverAccount() {
  try {
    console.log('\nTesting Driver Account Deletion...');
    
    const response = await axios.delete(`${BASE_URL}/driverAuth/delete-account`, {
      data: {
        phone: TEST_DRIVER_PHONE
      }
    });
    
    console.log('✅ Driver account deleted successfully:', response.data);
    return true;
  } catch (error) {
    if (error.response) {
      console.log('❌ Driver account deletion failed:', error.response.data);
    } else {
      console.log('❌ Driver account deletion failed:', error.message);
    }
    return false;
  }
}

// Test with invalid phone number
async function testDeleteAccountWithInvalidPhone() {
  try {
    console.log('\nTesting Account Deletion with Invalid Phone...');
    
    const response = await axios.delete(`${BASE_URL}/auth/delete-account`, {
      data: {
        phone: 'invalid_phone'
      }
    });
    
    console.log('❌ Should have failed with invalid phone:', response.data);
    return false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('✅ Correctly failed with invalid phone number');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.message);
      return false;
    }
  }
}

// Test with missing phone number
async function testDeleteAccountWithMissingPhone() {
  try {
    console.log('\nTesting Account Deletion with Missing Phone...');
    
    const response = await axios.delete(`${BASE_URL}/auth/delete-account`, {
      data: {}
    });
    
    console.log('❌ Should have failed with missing phone:', response.data);
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Correctly failed with missing phone number');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.message);
      return false;
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Delete Account API Tests...\n');
  
  const results = [];
  
  results.push(await testDeleteAccountWithMissingPhone());
  results.push(await testDeleteAccountWithInvalidPhone());
  results.push(await testDeleteUserAccount());
  results.push(await testDeleteDriverAccount());
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${results.filter(r => r).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r).length}`);
  
  if (results.every(r => r)) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testDeleteUserAccount,
  testDeleteDriverAccount,
  testDeleteAccountWithInvalidPhone,
  testDeleteAccountWithMissingPhone,
  runAllTests
};








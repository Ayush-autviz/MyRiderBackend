const crypto = require('crypto');

// PayFast environment setup
function getPayFastConfig() {
  const merchantId = process.env.NODE_ENV === 'production' ? process.env.PAYFAST_MERCHANT_ID : 10000100;
  const merchantKey = process.env.NODE_ENV === 'production' ? process.env.PAYFAST_MERCHANT_KEY : '46f0cd694581a';
  const passphrase = process.env.NODE_ENV === 'production' ? process.env.PAYFAST_PASSPHRASE : 'jt7NOE43FZPn';
  
  if (!merchantId || !merchantKey) {
    throw new Error('PayFast credentials not found in environment variables');
  }

  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    merchantId,
    merchantKey,
    passphrase,
    isProduction,
    baseUrl: isProduction 
      ? 'https://www.payfast.co.za/eng/process' 
      : 'https://sandbox.payfast.co.za/eng/process',
    validateUrl: isProduction
      ? 'https://www.payfast.co.za/eng/query/validate'
      : 'https://sandbox.payfast.co.za/eng/query/validate'
  };
}

// Generate PayFast signature
function generateSignature(data, passphrase = '') {
  const crypto = require('crypto');
 
  // Clone data so we don't modify the original
  const dataCopy = { ...data };
 
  // Only include passphrase if it's set
  if (passphrase) {
    dataCopy.passphrase = passphrase;
  }
 
  // Sort keys
  const sortedKeys = Object.keys(dataCopy).sort();
  let paramString = '';
 
  for (const key of sortedKeys) {
    // PayFast requires even empty keys to be included as key=
    const value = dataCopy[key] ?? '';
    paramString += `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}&`;
  }
 
  // Remove trailing &
  paramString = paramString.slice(0, -1);
 
  // Generate MD5 hash
  return crypto.createHash('md5').update(paramString).digest('hex');
}

// Validate PayFast data
function validateSignature(data, signature, passphrase = '') {
  const generatedSignature = generateSignature(data, passphrase);
  return generatedSignature === signature;
}

// Generate payment URL
function generatePaymentUrl(paymentData) {
  const config = getPayFastConfig();
  
  // Add merchant credentials
  const data = {
    ...paymentData,
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey
  };
  
  // Generate signature
  const signature = generateSignature(data, config.passphrase);
  data.signature = signature;
  
  // Create query string
  const queryString = Object.keys(data)
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&');
  
  return `${config.baseUrl}?${queryString}`;
}

module.exports = {
  getPayFastConfig,
  generateSignature,
  validateSignature,
  generatePaymentUrl
}; 
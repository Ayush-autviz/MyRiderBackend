const crypto = require('crypto');

// PayFast environment setup
function getPayFastConfig() {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  
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
  // Create parameter string
  let paramString = '';
  
  // Sort keys and create query string
  const sortedKeys = Object.keys(data).sort();
  
  for (const key of sortedKeys) {
    if (data[key] !== '') {
      paramString += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}&`;
    }
  }
  
  // Remove trailing &
  paramString = paramString.slice(0, -1);
  
  // Add passphrase if provided
  if (passphrase) {
    paramString += `&passphrase=${encodeURIComponent(passphrase)}`;
  }
  
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
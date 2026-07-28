const axios = require("axios");

let cachedToken = null;
let tokenExpiry = null;

const getAuthToken = async () => {
  // If we have a cached token and it hasn't expired yet (with a 5-minute buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  const clientId = process.env.SMSPORTAL_CLIENT_ID;
  const secret = process.env.SMSPORTAL_SECRET;

  console.log(clientId, secret)

  if (!clientId || !secret) {
    throw new Error("SMSPortal Client ID or Secret is not configured in env variables.");
  }

  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");

  try {
    const response = await axios.post(
      "https://rest.smsportal.com/v1/authentication",
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const token = response.data.token;
    // Set expiry to 24 hours (86400 seconds) from now
    cachedToken = token;
    tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    console.log("Successfully fetched new SMSPortal token.");
    return cachedToken;
  } catch (error) {
    console.error("SMSPortal authentication failed:", error.response ? error.response.data : error.message);
    throw new Error("Failed to authenticate with SMSPortal");
  }
};

const sendOtp = async (phone, otp) => {
  const token = await getAuthToken();
  const url = "https://rest.smsportal.com/v3/BulkMessages";
  const formattedPhone = phone.replace(/^\+/, "");

  try {
    const response = await axios.post(
      url,
      {
        messages: [
          {
            content: `Your verification code is: ${otp}. It expires in 2 minutes.`,
            destination: formattedPhone,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("OTP sent successfully via SMSPortal:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending OTP via SMSPortal:", error.response ? error.response.data : error.message);
    throw new Error("Failed to send OTP");
  }
};

module.exports = {
  sendOtp,
};

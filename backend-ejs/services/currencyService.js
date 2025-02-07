const axios = require("axios");
const Currency = require("../models/Currency");

const EXCHANGE_API_KEY = "92beb9d7d29a4342e8f45775";

const fetchCurrencyData = async () => {
  try {
    // USD/TRY ve EUR/TRY için ayrı istekler
    const [usdResponse, eurResponse] = await Promise.all([
      axios.get(
        `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/pair/USD/TRY`
      ),
      axios.get(
        `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/pair/EUR/TRY`
      ),
    ]);

    // Sabit değişim oranları (gerçek piyasa verisi)
    const usdChange = -0.04;
    const eurChange = -0.16;

    const currencyData = {
      usdRate: usdResponse.data.conversion_rate,
      usdChange,
      eurRate: eurResponse.data.conversion_rate,
      eurChange,
      timestamp: new Date(),
    };

    const currency = await Currency.create(currencyData);
    console.log("Currency data saved:", currency);
    return currency;
  } catch (error) {
    console.error("Error fetching currency data:", error.message);
    throw error;
  }
};

module.exports = { fetchCurrencyData };

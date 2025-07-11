const axios = require("axios");

async function testEndpoint() {
  try {
    console.log("🔍 Testing medical devices endpoint...");

    const response = await axios.get(
      "http://localhost:8000/api/v1/equipos/medical-devices-complete",
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        timeout: 10000,
      }
    );

    console.log("✅ Response Status:", response.status);
    console.log("📊 Response Headers:", response.headers);
    console.log("📦 Response Data:", JSON.stringify(response.data, null, 2));

    // Verificar estructura de respuesta
    if (response.data) {
      console.log("\n🔍 Response Analysis:");
      console.log("- Type:", typeof response.data);
      console.log("- Has success property:", "success" in response.data);
      console.log("- Has data property:", "data" in response.data);
      console.log("- Has message property:", "message" in response.data);

      if (response.data.data) {
        console.log("- Data type:", typeof response.data.data);
        console.log("- Data is array:", Array.isArray(response.data.data));
        console.log("- Data length:", response.data.data.length);
      }
    }
  } catch (error) {
    console.error("❌ Error testing endpoint:");
    console.error("- Status:", error.response?.status);
    console.error("- Message:", error.message);
    console.error("- Response:", error.response?.data);
  }
}

testEndpoint();

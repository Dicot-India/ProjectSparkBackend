const SendWhatsappMsg = async (to: string, msg: string) => {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: `+91${to}`,
    type: "template",
    template: {
      name: "main",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: msg }],
        },
      ],
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log(response);

    const responseBody = await response.json();
    console.log(responseBody)

    if (Array.isArray(responseBody.messages)) {
      if (responseBody.messages[0]?.message_status === "accepted") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error: any) {
    console.error("Error sending WhatsApp message:", error.message || error);
    throw error;
  }
};

export default SendWhatsappMsg;

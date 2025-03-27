async function refreshAccessToken(
    refreshToken: string,
    client_id: string,
    client_secret: string
) {
    const url = "https://accounts.zoho.in/oauth/v2/token";
    const params = new URLSearchParams({
        refresh_token: refreshToken,
        client_id: client_id,
        client_secret: client_secret,
        grant_type: "refresh_token",
    });


    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        });

        const data = await response.json();
        console.log(data);

        return data?.access_token; // Return the new access token
    } catch (error) {
        console.error("Error refreshing access token:", error);
    }
}

const SendMail = async (toEmail: string, content: any) => {
    let accountId;
    let refreshToken;
    let accountEmail;
    let clientId;
    let clientSecret;
    let code = 0;

    const accountIdString = "5228294000000002002"

    accountEmail = "no-reply@dicot.in";
    accountId = BigInt(accountIdString);
    refreshToken = "1000.a0388a48e4bc6e81fbde11aa38ff5fb5.09335889047b7eea24b6a8b69e8b9d2c";
    clientId = "1000.YPXLBCC95QQEOL1RO5DQB72ZDSB7XP";
    clientSecret = "9a0db798affe331669d324db9a7bb188cc00a251be";

    const accessToken = await refreshAccessToken(
        refreshToken,
        clientId,
        clientSecret
    );

    if (accessToken) {
        const response = await fetch(
            `https://mail.zoho.in/api/accounts/${accountId}/messages`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
                body: JSON.stringify({
                    fromAddress: accountEmail,
                    toAddress: toEmail,
                    subject: content.subject,
                    content: content.body,
                }),
            }
        );

        const responseBody = await response.json();
        console.log(responseBody);
        if (responseBody?.status?.code === 200) {
            code = responseBody?.status?.code;
            return code;
        } else {
            code = responseBody?.status?.code;
            return code;
        }
    } else {
        return code;
    }
};

export default SendMail;
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed"
    });
  }

  const url = "https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMWx78g2JV4NMCIsmQtpUUlYD86bCbjzN-dd_1-QCMFrL2OfqnPrSqH_om71cOCurcsTLRVz0hKRXElhE60sbro0rggpoKUB4Nl8dhCECUwqd4axew_9qrH7e5FUJVslRTNZdHc9MFh50nJNJCYcQFKP48Pub58R-p49viohOVf48VzQ5HOwuUbMpJrmQhYXhSRykKyGCj1QYNBhoPQYkF0FAVGt2NzDS9cOLS6UAoSz54IJjThombBbtk_YDXxx3o6z6oO1w5_K1AIpLvOys-ls9ZP9CjLZbUnjVCbyED5PmH6e0kc&lib=M62DVCIDDVDbIk9zHKt2ODOA3qwdUz_ea";

  try {
    const response = await fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        status: "success",
        message: text
      };
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to submit RSVP",
      details: error.message
    });
  }
}

export default async function handler(req, res) {
  const url = "https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMWx78g2JV4NMCIsmQtpUUlYD86bCbjzN-dd_1-QCMFrL2OfqnPrSqH_om71cOCurcsTLRVz0hKRXElhE60sbro0rggpoKUB4Nl8dhCECUwqd4axew_9qrH7e5FUJVslRTNZdHc9MFh50nJNJCYcQFKP48Pub58R-p49viohOVf48VzQ5HOwuUbMpJrmQhYXhSRykKyGCj1QYNBhoPQYkF0FAVGt2NzDS9cOLS6UAoSz54IJjThombBbtk_YDXxx3o6z6oO1w5_K1AIpLvOys-ls9ZP9CjLZbUnjVCbyED5PmH6e0kc&lib=M62DVCIDDVDbIk9zHKt2ODOA3qwdUz_ea&action=event";

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow"
    });

    const text = await response.text();
    const data = JSON.parse(text);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to load event details",
      details: error.message
    });
  }
}

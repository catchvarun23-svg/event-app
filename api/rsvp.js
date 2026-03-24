export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed"
    });
  }

  const url =
    "https://script.google.com/macros/s/AKfycbyh4WRyWn8oCNqK1Cz-JjOkCrp5ndGPXiKjAnWjgX5_9XsnWGBJxIOhc-zfAtd9EIFY/exec";

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
      return res.status(500).json({
        status: "error",
        message: "Apps Script did not return JSON",
        raw: text.substring(0, 500)
      });
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

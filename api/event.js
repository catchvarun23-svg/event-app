export default async function handler(req, res) {
  const apiUrl = "https://script.google.com/macros/s/AKfycbzJ8NPxiQX1RhSxkVyQu8QeuE0mTA-V_A-M4aL07b0wm2HXbqwAW8LocfO5k1bwwmH9/exec?action=event";

  try {
    const response = await fetch(apiUrl);
    const text = await response.text(); // IMPORTANT

    const data = JSON.parse(text); // handle GAS response

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load event details" });
  }
}

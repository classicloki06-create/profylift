export default async function handler(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "No message provided" });
    }

    // simple manual AI (for now)
    let reply = "Something went wrong";

    const msg = message.toLowerCase();

    if (msg.includes("hi") || msg.includes("hello")) {
      reply = "Hey 👋 how can I help you with Profylift?";
    } 
    else if (msg.includes("price")) {
      reply = "Our pricing depends on your needs. DM us or book a call to get details.";
    } 
    else if (msg.includes("service")) {
      reply = "We offer reels editing, content strategy, and full Instagram growth.";
    } 
    else {
      reply = "I didn’t fully get that, but I can help with services, pricing, or growth 🚀";
    }

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({ reply: "Server error" });
  }
}

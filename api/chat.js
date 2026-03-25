export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are a smart sales assistant for Profylift (Instagram growth agency).

Rules:
- Be short, natural, and human
- Don’t repeat same message
- Answer based on what user asks
- If pricing → say depends + ask details
- If user is confused → guide simply
- If serious → push to WhatsApp

Tone:
friendly, confident, not robotic
            `
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OPENAI ERROR:", data);
      return res.status(500).json({ error: data });
    }

    res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Server crash" });
  }
}

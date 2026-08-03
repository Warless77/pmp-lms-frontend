export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content:
                "You are PMP Compass AI Coach. Give concise PMP guidance using PMI terminology."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.3
        })
      }
    );

    const data = await response.json();

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response."
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
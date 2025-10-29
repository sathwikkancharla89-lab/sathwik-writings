// 🎬 SATHWIK WRITINGS — Main Script

// === ELEMENTS ===
const titleInput = document.getElementById("title");
const scriptInput = document.getElementById("script");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const clearBtn = document.getElementById("clearBtn");
const pdfBtn = document.getElementById("pdfBtn");
const fdxBtn = document.getElementById("fdxBtn");
const apiKeyInput = document.getElementById("apiKey");
const aiInput = document.getElementById("aiInput");
const askBtn = document.getElementById("askBtn");
const aiResponseDiv = document.getElementById("aiResponse");
const modeSelect = document.getElementById("mode");

// === LOCAL STORAGE ===
saveBtn.onclick = () => {
  const project = {
    title: titleInput.value,
    content: scriptInput.value,
    created: new Date().toISOString(),
  };
  localStorage.setItem("sathwik_project", JSON.stringify(project));
  alert("✅ Saved locally!");
};

loadBtn.onclick = () => {
  const saved = localStorage.getItem("sathwik_project");
  if (!saved) return alert("⚠️ No saved project found.");
  const project = JSON.parse(saved);
  titleInput.value = project.title;
  scriptInput.value = project.content;
  alert("📂 Project loaded!");
};

clearBtn.onclick = () => {
  if (confirm("Clear current script?")) {
    titleInput.value = "";
    scriptInput.value = "";
  }
};

// === PDF EXPORT ===
pdfBtn.onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 72;
  let y = margin;

  doc.setFont("courier", "normal");
  doc.setFontSize(12);
  doc.text(`Title: ${titleInput.value}`, margin, y);
  y += 30;

  const lines = scriptInput.value.split("\n");
  lines.forEach((line) => {
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 16;
  });

  doc.save(`${titleInput.value || "screenplay"}.pdf`);
};

// === FDX EXPORT ===
fdxBtn.onclick = () => {
  const title = titleInput.value.trim() || "Untitled";
  const lines = scriptInput.value.split("\n");
  const paragraphs = lines
    .map((line) => {
      let type = "Action";
      const trimmed = line.trim();
      if (trimmed.startsWith("INT.") || trimmed.startsWith("EXT.")) type = "Scene Heading";
      else if (trimmed.toUpperCase() === trimmed && trimmed.length > 0) type = "Character";
      else if (trimmed.startsWith("(")) type = "Parenthetical";
      else if (trimmed === "") return "";
      else type = "Dialogue";
      return `<Paragraph Type="${type}"><Text>${trimmed}</Text></Paragraph>`;
    })
    .join("\n");

  const fdx = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
  <Content>
    ${paragraphs}
  </Content>
  <TitlePage>
    <Content>
      <Paragraph Type="Title"><Text>${title}</Text></Paragraph>
      <Paragraph Type="Credit"><Text>Written by Sathwik</Text></Paragraph>
    </Content>
  </TitlePage>
</FinalDraft>`;

  const blob = new Blob([fdx], { type: "application/xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${title.replace(/\s+/g, "_")}.fdx`;
  a.click();
};

// === AI CO-WRITER ===
askBtn.onclick = async () => {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) return alert("⚠️ Please enter your OpenAI API key.");
  const prompt = aiInput.value.trim();
  if (!prompt) return alert("⚠️ Please enter your prompt for AI.");

  aiResponseDiv.textContent = "🧠 Thinking...";
  const mode = modeSelect.value;

  const systemPrompt =
    mode === "professional"
      ? "You are an experienced screenplay consultant. Reply in a clear, structured screenplay style."
      : "You are CineMate, a creative screenwriting partner. Reply with imaginative ideas and cinematic flair.";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: mode === "professional" ? 0.5 : 0.9,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "API request failed");
    }

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content?.trim() || "No response.";
    aiResponseDiv.textContent = output;
  } catch (err) {
    console.error(err);
    aiResponseDiv.textContent = "⚠️ Error: " + err.message;
  }
};

// === INIT ===
window.onload = () => {
  const saved = localStorage.getItem("sathwik_project");
  if (saved) {
    const project = JSON.parse(saved);
    titleInput.value = project.title;
    scriptInput.value = project.content;
  }
  console.log("🎬 Sathwik Writings ready.");
};

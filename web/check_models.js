
const apiKey = 'AIzaSyDRE_JrMWO9veD0fqXxLPzEAMO_qmXiqGk';

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
        console.log("Available Models:");
        data.models.forEach(m => {
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- ${m.name} (${m.displayName})`);
            }
        });
    } else {
        console.log("Error/No models:", data);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

listModels();

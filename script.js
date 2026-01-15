// --- UPDATED 2026 API CONNECTOR ---
async callGeminiAPI(prompt, outputElement) {
    if (!this.apiKey) {
        outputElement.innerHTML = `<div class="p-6 bg-red-50 text-red-700 rounded-2xl font-black uppercase text-xs italic">⚠️ Setup Required: Add API Key</div>`;
        return;
    }

    outputElement.innerHTML = `<div class="p-8 bg-indigo-50 rounded-3xl animate-pulse text-center">
        <span class="text-indigo-800 font-black text-sm uppercase tracking-widest italic">Resolving Coherence Architecture (v3.0)...</span>
    </div>`;

    try {
        // UPDATED: Using the 2026 Gemini 3 Flash stable endpoint
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3-flash:generateContent?key=${this.apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message || "Connection Decoherence");

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
            const formatted = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            outputElement.innerHTML = `<div class="bg-white border-2 border-indigo-100 p-8 rounded-[2rem] shadow-sm text-slate-700 text-sm leading-relaxed">${formatted}</div>`;
        }
    } catch (e) {
        outputElement.innerHTML = `<div class="p-8 bg-red-50 text-red-600 rounded-3xl text-xs font-bold uppercase border-2 border-red-100">
            Thermodynamic Failure: ${e.message}
        </div>`;
    }
}

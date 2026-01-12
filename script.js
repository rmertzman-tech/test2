document.addEventListener('DOMContentLoaded', () => {

    window.app = {
        apiKey: localStorage.getItem('ethical_cartography_key') || "",
        currentComparison: null,
        currentResonance: null,
        currentModalFigure: null,
        previousFocus: null,

        // Data from data.js
        navigators: appData.navigators,
        thinkers: appData.thinkers,
        concepts: appData.concepts,
        foundations: appData.foundations,
        caseStudies: appData.caseStudies,
        essays: appData.essays,

        frameworkContext: `
            You are the 'Ethical Cartography' AI Tutor.
            1. PRF = Phenomenal Reference Frame (The agent's lived horizon).
            2. BROA+ = Biological, Identity, Cognitive, Institutional, and Temporal coherence.
            3. ATCF = Measure of narrative and prospective integrity.
            4. Constructor Ethics: Evaluate by coherence preservation.
        `,

        init() {
            console.log("Initializing Lab...");
            this.setupEventListeners();
            this.renderAllContent();
            
            if (this.apiKey) {
                const keyInput = document.getElementById('api-key-input-settings');
                if (keyInput) keyInput.value = this.apiKey;
            }
        },

        // --- ACCESSIBILITY ---
        speakText(text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        },

        handleReadAloud(containerId) {
            const container = document.getElementById(containerId);
            if (container) this.speakText(container.innerText || container.textContent);
        },

        // --- RENDERING (Fixed IDs) ---
        renderAllContent() {
            const safeRender = (id, data, htmlFunc) => {
                const el = document.getElementById(id);
                if (el && data) {
                    el.innerHTML = data.map((item, index) => htmlFunc.call(this, item, index)).join('');
                } else {
                    console.warn(`Target ID #${id} not found in HTML.`);
                }
            };

            safeRender('profile-grid', this.navigators, (item, i) => this.createCardHtml(item, 'navigator', i));
            safeRender('thinker-grid', this.thinkers, (item, i) => this.createCardHtml(item, 'thinker', i));
            safeRender('foundation-grid', this.foundations, (item, i) => this.createSimpleCardHtml(item, 'foundation', i));
            safeRender('casestudy-grid', this.caseStudies, (item, i) => this.createSimpleCardHtml(item, 'casestudy', i));
            
            const disclaimerEl = document.getElementById('disclaimer-text');
            if(disclaimerEl && appData.disclaimerText) disclaimerEl.textContent = appData.disclaimerText;
        },
        
        createCardHtml(item, type, index) {
            const colorClass = type === 'navigator' ? 'text-indigo-700' : 'text-teal-700';
            return `
                <article role="button" tabindex="0" class="profile-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer flex flex-col" 
                         data-type="${type}" data-index="${index}">
                    <h3 class="text-xl font-bold ${colorClass}">${item.name}</h3>
                    <p class="text-sm text-gray-500 mb-2">${item.lifespan}</p>
                    <p class="font-semibold text-gray-800 text-sm">${item.title}</p>
                    <p class="text-gray-600 mt-2 text-xs flex-grow">${item.summary}</p>
                </article>`;
        },

        createSimpleCardHtml(item, type, index) {
            const colors = { foundation: 'text-gray-800', casestudy: 'text-yellow-800' };
            return `
                <article role="button" tabindex="0" class="simple-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer flex flex-col" data-type="${type}" data-index="${index}">
                      <h3 class="text-lg font-bold ${colors[type] || 'text-gray-900'}">${item.title}</h3>
                      <p class="text-gray-600 mt-2 text-xs flex-grow">${item.summary}</p>
                </article>`;
        },

        // --- UI LOGIC ---
        setupEventListeners() {
            // Start Button
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    document.getElementById('welcome-screen').classList.add('hidden');
                    document.getElementById('app-container').classList.remove('hidden');
                });
            }

            // Tab Navigation (Mapped to your specific HTML IDs)
            const tabButtons = document.querySelectorAll('.tab-btn');
            tabButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Normalize ID mapping
                    let targetId = btn.id.replace('-tab', '-section');
                    
                    const section = document.getElementById(targetId);
                    if (section) {
                        document.querySelectorAll('[role="tabpanel"]').forEach(p => p.classList.add('hidden'));
                        section.classList.remove('hidden');
                        
                        tabButtons.forEach(b => {
                            b.setAttribute('aria-selected', 'false');
                            b.classList.remove('bg-indigo-100', 'border-indigo-600');
                        });
                        btn.setAttribute('aria-selected', 'true');
                        btn.classList.add('bg-indigo-100', 'border-indigo-600');
                    }
                });
            });

            // Settings
            document.getElementById('settings-btn').addEventListener('click', () => document.getElementById('settings-api-key-modal').classList.remove('hidden'));
            document.getElementById('cancel-api-key-btn').addEventListener('click', () => document.getElementById('settings-api-key-modal').classList.add('hidden'));
            document.getElementById('save-api-key-btn').addEventListener('click', () => {
                this.apiKey = document.getElementById('api-key-input-settings').value.trim();
                localStorage.setItem('ethical_cartography_key', this.apiKey);
                document.getElementById('settings-api-key-modal').classList.add('hidden');
            });

            // Card Clicks
            document.querySelectorAll('.card-container').forEach(c => {
                c.addEventListener('click', e => this.handleCardClick(e));
            });

            // Resonance Lab
            const resBtn = document.getElementById('find-counterparts-btn');
            if (resBtn) resBtn.addEventListener('click', () => this.handleResonanceLab());
            
            const resChatBtn = document.getElementById('resonance-send-btn');
            if (resChatBtn) resChatBtn.addEventListener('click', () => this.handleResonanceChat());
        },

        handleCardClick(e) {
            const card = e.target.closest('article[data-index]');
            if (!card) return;
            const type = card.dataset.type;
            const index = card.dataset.index;
            let data;
            if (type === 'navigator') data = this.navigators[index];
            if (type === 'thinker') data = this.thinkers[index];
            if (type === 'foundation') data = this.foundations[index];
            if (type === 'casestudy') data = this.caseStudies[index];
            
            if (data) this.showDetailModal(data, type);
        },

        showDetailModal(data, type) {
            const modalContentEl = document.getElementById('modal-content-details');
            const modal = document.getElementById('detail-modal');
            this.previousFocus = document.activeElement;
            
            if (type === 'navigator' || type === 'thinker') {
                modalContentEl.innerHTML = this.getPersonModalHtml(data);
                this.currentModalFigure = data;
            } else {
                modalContentEl.innerHTML = this.getSimpleModalHtml(data);
            }
            
            modal.classList.remove('hidden');
            const closeBtn = document.getElementById('close-modal');
            closeBtn.onclick = () => {
                modal.classList.add('hidden');
                if (this.previousFocus) this.previousFocus.focus();
                window.speechSynthesis.cancel();
            };

            // Set up modal internal chat if person
            if (this.currentModalFigure) {
                const sendBtn = document.getElementById('modal-chat-send');
                if (sendBtn) sendBtn.onclick = () => this.handleModalChat(document.getElementById('modal-chat-input'));
            }
        },

        getPersonModalHtml(data) {
            return `
                <h2 class="text-3xl font-bold mb-1">${data.name}</h2>
                <p class="text-gray-500 mb-4">${data.title}</p>
                <button onclick="app.handleReadAloud('kernel-details')" class="mb-4 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold">🔊 Read Analysis</button>
                <div id="kernel-details" class="space-y-4 text-sm">
                    <div class="bg-gray-50 p-3 rounded"><strong>Assembly History:</strong> ${data.assemblyHistory}</div>
                    <div><strong>BROA+ (Phenomenal Frame):</strong> ${data.broa}</div>
                    <div><strong>ATCF:</strong> ${data.atcf}</div>
                    <div><strong>Capabilities:</strong> ${(data.capabilities || []).join(', ')}</div>
                </div>
                <div class="border-t pt-4 mt-6">
                    <h4 class="font-bold text-indigo-900 mb-2">Engage with ${data.name} ✨</h4>
                    <div id="modal-chat-output" class="mb-2 text-xs"></div>
                    <div class="flex">
                        <input type="text" id="modal-chat-input" class="flex-1 border rounded-l p-2 text-sm" placeholder="Ask a question...">
                        <button id="modal-chat-send" class="bg-indigo-600 text-white px-4 rounded-r">Send</button>
                    </div>
                </div>`;
        },

        getSimpleModalHtml(data) {
            return `
                <h2 class="text-2xl font-bold mb-2">${data.title}</h2>
                <p class="text-gray-600 mb-4">${data.summary}</p>
                <div class="text-sm text-gray-700">${data.content || data.analysis || ""}</div>`;
        },

        async callGeminiAPI(prompt, outputElement) {
            if (!this.apiKey) {
                outputElement.innerHTML = "Error: Key missing.";
                return;
            }
            outputElement.innerHTML = "Thinking...";
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
                });
                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    outputElement.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                }
            } catch (e) {
                outputElement.innerHTML = "API Error.";
            }
        },

        async handleResonanceLab() {
            const input = document.getElementById('resonance-input').value;
            if (!input) return;
            const out = document.getElementById('counterparts-output');
            const prompt = `${this.frameworkContext}\nStudent PRF: "${input}"\nIdentify 3 role models and explain Functional Equivalence.`;
            await this.callGeminiAPI(prompt, out);
            document.getElementById('resonance-chat-container').classList.remove('hidden');
        },

        handleResonanceChat() {
            const input = document.getElementById('resonance-chat-input');
            const out = document.getElementById('counterparts-output');
            this.appendChatTurn(out, input.value, `${this.frameworkContext}\nFollow up: ${input.value}`);
            input.value = "";
        },

        handleModalChat(inputEl) {
            const out = document.getElementById('modal-chat-output');
            const prompt = `SIMULATION: You are ${this.currentModalFigure.name}. Question: ${inputEl.value}`;
            this.appendChatTurn(out, inputEl.value, prompt);
            inputEl.value = "";
        },

        appendChatTurn(container, userText, prompt) {
            const d = document.createElement('div');
            d.innerHTML = `<div class="mt-2 text-blue-800">Q: ${userText}</div><div class="ai-res">...</div>`;
            container.appendChild(d);
            this.callGeminiAPI(prompt, d.querySelector('.ai-res'));
        }
    };

    app.init();
});

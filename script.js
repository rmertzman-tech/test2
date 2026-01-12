document.addEventListener('DOMContentLoaded', () => {

    window.app = {
        apiKey: localStorage.getItem('ethical_cartography_key') || "",
        currentModalFigure: null,
        previousFocus: null,

        // Data from data.js
        navigators: appData.navigators,
        thinkers: appData.thinkers,
        foundations: appData.foundations,
        caseStudies: appData.caseStudies,

        frameworkContext: `
            You are the 'Ethical Cartography' AI Tutor.
            1. PRF = Phenomenal Reference Frame (The agent's lived horizon).
            2. BROA+ = Biological, Identity, Cognitive, Institutional, and Temporal coherence.
            3. ATCF = Measure of narrative and prospective integrity.
            4. Constructor Ethics: Evaluate by coherence preservation.
        `,

        init() {
            console.log("Lab Initialization Sequence Started...");
            this.renderAllContent();
            this.setupEventListeners();
            
            if (this.apiKey) {
                const keyInput = document.getElementById('api-key-input-settings');
                if (keyInput) keyInput.value = this.apiKey;
            }
        },

        // --- ACCESSIBILITY & AUDIO ---
        speakText(text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        },

        // --- RENDERING ENGINE ---
        renderAllContent() {
            const safeRender = (id, data, htmlFunc) => {
                const el = document.getElementById(id);
                if (el && data) {
                    el.innerHTML = data.map((item, index) => htmlFunc.call(this, item, index)).join('');
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
            const borderClass = type === 'navigator' ? 'border-indigo-100' : 'border-teal-100';
            return `
                <article role="button" tabindex="0" class="profile-card bg-white p-6 rounded-xl shadow-sm border ${borderClass} hover:shadow-md transition-all cursor-pointer flex flex-col" 
                         data-type="${type}" data-index="${index}">
                    <h3 class="text-xl font-bold ${colorClass}">${item.name}</h3>
                    <p class="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">${item.lifespan}</p>
                    <p class="font-semibold text-gray-800 text-sm leading-tight mb-3">${item.title}</p>
                    <p class="text-gray-600 text-xs line-clamp-3 flex-grow">${item.summary}</p>
                    <div class="mt-4 text-indigo-500 text-xs font-bold flex items-center gap-1">
                        View Phenomenal Frame →
                    </div>
                </article>`;
        },

        createSimpleCardHtml(item, type, index) {
            const colorMap = { foundation: 'text-gray-800 border-gray-100', casestudy: 'text-amber-800 border-amber-100' };
            return `
                <article role="button" tabindex="0" class="simple-card bg-white p-6 rounded-xl shadow-sm border ${colorMap[type]} hover:shadow-md transition-all cursor-pointer flex flex-col" data-type="${type}" data-index="${index}">
                      <h3 class="text-lg font-bold mb-2">${item.title}</h3>
                      <p class="text-gray-600 text-xs line-clamp-3 flex-grow">${item.summary}</p>
                </article>`;
        },

        // --- AI API LOGIC ---
        async callGeminiAPI(prompt, outputElement) {
            if (!this.apiKey) {
                outputElement.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-bold">⚠️ Error: Please enter your API Key in the Settings (gear icon).</div>`;
                return;
            }

            outputElement.innerHTML = `
                <div class="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg animate-pulse">
                    <div class="loader m-0"></div>
                    <span class="text-indigo-700 font-medium text-sm">Consulting Identity Kernel...</span>
                </div>`;

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
                });

                if (!response.ok) throw new Error("Network response was not ok");

                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (text) {
                    // Inject formatted text with Audio Button
                    const formattedText = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    const turnId = "speech-" + Math.random().toString(36).substr(2, 9);
                    
                    outputElement.innerHTML = `
                        <div class="p-4 bg-white border border-indigo-100 rounded-lg shadow-sm">
                            <button onclick="app.speakText(document.getElementById('${turnId}').innerText)" class="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-700">
                                🔊 Read Aloud
                            </button>
                            <div id="${turnId}" class="text-sm text-gray-700 leading-relaxed">${formattedText}</div>
                        </div>`;
                    outputElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } catch (e) {
                outputElement.innerHTML = `<div class="p-4 bg-red-50 text-red-600 rounded-lg text-xs italic">Entropy detected: The AI failed to respond. Please check your connection or API key.</div>`;
            }
        },

        // --- EVENT HANDLERS ---
        setupEventListeners() {
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    document.getElementById('welcome-screen').classList.add('hidden');
                    document.getElementById('app-container').classList.remove('hidden');
                });
            }

            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetId = btn.id.replace('-tab', '-section');
                    document.querySelectorAll('[role="tabpanel"]').forEach(p => p.classList.add('hidden'));
                    document.getElementById(targetId).classList.remove('hidden');
                    
                    document.querySelectorAll('.tab-btn').forEach(b => {
                        b.setAttribute('aria-selected', 'false');
                        b.className = "tab-btn px-3 py-2 font-medium text-sm rounded-t-md text-gray-500 hover:text-gray-800";
                    });
                    btn.setAttribute('aria-selected', 'true');
                    btn.className = "tab-btn px-3 py-2 font-bold text-sm rounded-t-md bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600";
                });
            });

            document.getElementById('settings-btn').addEventListener('click', () => document.getElementById('settings-api-key-modal').classList.remove('hidden'));
            document.getElementById('save-api-key-btn').addEventListener('click', () => {
                this.apiKey = document.getElementById('api-key-input-settings').value.trim();
                localStorage.setItem('ethical_cartography_key', this.apiKey);
                document.getElementById('settings-api-key-modal').classList.add('hidden');
                location.reload(); // Refresh to apply key
            });

            document.querySelectorAll('.card-container').forEach(c => {
                c.addEventListener('click', e => this.handleCardClick(e));
            });

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
            let data = (type === 'navigator') ? this.navigators[index] : 
                       (type === 'thinker') ? this.thinkers[index] :
                       (type === 'foundation') ? this.foundations[index] : this.caseStudies[index];
            
            if (data) this.showDetailModal(data, type);
        },

        showDetailModal(data, type) {
            const modalContentEl = document.getElementById('modal-content-details');
            const modal = document.getElementById('detail-modal');
            
            if (type === 'navigator' || type === 'thinker') {
                modalContentEl.innerHTML = this.getPersonModalHtml(data);
                this.currentModalFigure = data;
            } else {
                modalContentEl.innerHTML = this.getSimpleModalHtml(data);
            }
            
            modal.classList.remove('hidden');
            document.getElementById('close-modal').onclick = () => {
                modal.classList.add('hidden');
                window.speechSynthesis.cancel();
            };

            if (this.currentModalFigure) {
                document.getElementById('modal-chat-send').onclick = () => this.handleModalChat();
            }
        },

        getPersonModalHtml(data) {
            return `
                <div class="mb-6">
                    <h2 class="text-3xl font-black text-gray-900 mb-1">${data.name}</h2>
                    <p class="text-indigo-600 font-bold text-sm tracking-tight">${data.title}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="md:col-span-2 space-y-6">
                        <section>
                            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Assembly History</h4>
                            <div class="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-400">${data.assemblyHistory}</div>
                        </section>
                        <section>
                            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Phenomenal Reference Frame (BROA+)</h4>
                            <div class="text-sm text-gray-700 leading-relaxed">${data.broa}</div>
                        </section>
                    </div>
                    <div class="space-y-6">
                        <section class="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 class="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">ATCF Metric</h4>
                            <p class="text-xs text-indigo-900 leading-relaxed">${data.atcf}</p>
                        </section>
                        <section>
                            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Capabilities</h4>
                            <div class="flex flex-wrap gap-2">
                                ${(data.capabilities || []).map(c => `<span class="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600 shadow-sm">${c}</span>`).join('')}
                            </div>
                        </section>
                    </div>
                </div>
                <div class="mt-8 pt-8 border-t border-gray-100">
                    <h4 class="font-black text-gray-900 mb-4 flex items-center gap-2">
                        <span class="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase">Live Simulation</span>
                        Engage with ${data.name}
                    </h4>
                    <div id="modal-chat-output" class="space-y-4 mb-4"></div>
                    <div class="flex gap-2 p-2 bg-gray-100 rounded-xl">
                        <input type="text" id="modal-chat-input" class="flex-1 bg-transparent border-none focus:ring-0 p-2 text-sm" placeholder="Ask about their PRF or choices...">
                        <button id="modal-chat-send" class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition-colors">Send</button>
                    </div>
                </div>`;
        },

        getSimpleModalHtml(data) {
            return `
                <h2 class="text-3xl font-black text-gray-900 mb-4">${data.title}</h2>
                <div class="prose prose-indigo text-sm text-gray-700 max-w-none">
                    ${data.content || data.analysis || data.summary}
                </div>`;
        },

        async handleResonanceLab() {
            const input = document.getElementById('resonance-input').value;
            if (!input) return;
            const out = document.getElementById('counterparts-output');
            const prompt = `${this.frameworkContext}\nStudent Reflection: "${input}"\nIdentify 3 role models and explain how their capabilities are functionally equivalent to the student's goals. Use BROA+ terms.`;
            await this.callGeminiAPI(prompt, out);
            document.getElementById('resonance-chat-container').classList.remove('hidden');
        },

        handleModalChat() {
            const inputEl = document.getElementById('modal-chat-input');
            const out = document.getElementById('modal-chat-output');
            const question = inputEl.value;
            if (!question) return;

            const prompt = `SIMULATION: You are ${this.currentModalFigure.name}. Answer this student through your Phenomenal Reference Frame (PRF) and historical context: "${question}". Refer to ATCF or BROA+ if relevant.`;
            
            const turn = document.createElement('div');
            turn.innerHTML = `<div class="flex flex-col gap-1">
                                <span class="text-[10px] font-black text-gray-400 uppercase">You</span>
                                <div class="text-sm font-medium text-gray-900">${question}</div>
                                <div class="ai-res-box mt-2"></div>
                              </div>`;
            out.appendChild(turn);
            this.callGeminiAPI(prompt, turn.querySelector('.ai-res-box'));
            inputEl.value = "";
        }
    };

    app.init();
});

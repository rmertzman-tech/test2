document.addEventListener('DOMContentLoaded', () => {

    window.app = {
        apiKey: localStorage.getItem('ethical_cartography_key') || "",
        currentModalFigure: null,

        // KNOWLEDGE BASE: Integrated with 'Ethics in an Entropic World' (2026)
        frameworkContext: `
            You are the 'Ethical Cartography' AI Tutor, an expert in Constructor Ethics and multi-scale coherence. [cite: 10, 87]
            
            CORE ONTOLOGY:
            - PRF stands for **Phenomenal Reference Frame**. It is the agent's lived horizon of meaning. Maintain Ontological Pluralism: the formal architecture is universal, but its lived interpretation is plural[cite: 93, 105, 1176].
            - Multi-Scale Coherence (BROA+): Agency is a thermodynamic achievement requiring Biological (BRC), Identity (KIC), Cognitive (CIC), Institutional (ISC), and Temporal (TNC) alignment[cite: 46, 1047, 1329].
            - ATCF: The Adaptive Temporal Coherence Function measures Autobiographical (At), Present-Time (Tt), Prospective (Ct), and Meta-Constructive (Ft) coherence[cite: 754, 763, 764].
            - Thermodynamic Constraints: Ethical action carries metabolic and informational cost (Landauer's Principle)[cite: 82, 1337, 1351]. 
            - Sapolsky Function: Chronic stress degrades the prefrontal cortex, causing 'temporal collapse' where the future shrinks into the present[cite: 1059, 1061, 1083].
            - Identity Kernel: Composed of Coherent Information Bits (CIBs). Moral Injury occurs when incompatible CIBs create 'Moral Debt'[cite: 79, 716, 1244].
            
            INSTRUCTIONS: Diagnose the student's struggle across these scales[cite: 213]. Evaluate if the environment is making ethical behavior possible[cite: 217]. Use historical role models to suggest functional equivalents for their goals.
        `,

        init() {
            // Setup listeners FIRST so the Start button is reactive even if data rendering has a delay
            this.setupEventListeners();
            this.renderAllContent();
            
            if (this.apiKey) {
                const keyInput = document.getElementById('api-key-input-settings');
                if (keyInput) keyInput.value = this.apiKey;
            }
        },

        speakText(text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        },

        renderAllContent() {
            const safeRender = (id, data, htmlFunc) => {
                const el = document.getElementById(id);
                if (el && data) el.innerHTML = data.map((item, index) => htmlFunc.call(this, item, index)).join('');
            };

            safeRender('profile-grid', appData.navigators, (item, i) => this.createCardHtml(item, 'navigator', i));
            safeRender('thinker-grid', appData.thinkers, (item, i) => this.createCardHtml(item, 'thinker', i));
            safeRender('foundation-grid', appData.foundations, (item, i) => this.createSimpleCardHtml(item, 'foundation', i));
            safeRender('casestudy-grid', appData.caseStudies, (item, i) => this.createSimpleCardHtml(item, 'casestudy', i));
            
            const discEl = document.getElementById('disclaimer-text');
            if(discEl && appData.disclaimerText) discEl.textContent = appData.disclaimerText;
        },

        createCardHtml(item, type, index) {
            // Fixed color strings to ensure Tailwind detects them
            const accentColor = type === 'navigator' ? 'indigo' : 'teal';
            const accentClass = type === 'navigator' ? 'text-indigo-700' : 'text-teal-700';
            const borderClass = type === 'navigator' ? 'hover:border-indigo-400' : 'hover:border-teal-400';
            
            return `
                <article role="button" tabindex="0" class="profile-card group bg-white p-8 rounded-3xl shadow-sm border border-slate-200 ${borderClass} hover:shadow-xl transition-all cursor-pointer flex flex-col" data-type="${type}" data-index="${index}">
                    <h3 class="text-2xl font-black text-slate-900 group-hover:${accentClass} transition-colors">${item.name}</h3>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">${item.lifespan}</p>
                    <p class="text-slate-600 text-sm leading-relaxed line-clamp-4 flex-grow">${item.summary}</p>
                    <div class="mt-6 pt-6 border-t border-slate-50 ${accentClass} font-black text-xs uppercase tracking-widest">Analyze PRF →</div>
                </article>`;
        },

        createSimpleCardHtml(item, type, index) {
            return `
                <article role="button" tabindex="0" class="simple-card bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer" data-type="${type}" data-index="${index}">
                      <h3 class="text-xl font-black text-slate-900 mb-2">${item.title}</h3>
                      <p class="text-slate-500 text-sm leading-relaxed">${item.summary}</p>
                </article>`;
        },

        async callGeminiAPI(prompt, outputElement) {
            if (!this.apiKey) {
                outputElement.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold uppercase tracking-widest">⚠️ Missing API Key. Go to Settings.</div>`;
                return;
            }

            outputElement.innerHTML = `
                <div class="flex items-center gap-3 p-6 bg-indigo-50 rounded-2xl animate-pulse">
                    <div class="loader m-0"></div>
                    <span class="text-indigo-700 font-bold text-sm tracking-tight">Resolving Coherence Architecture...</span>
                </div>`;

            try {
                const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        contents: [{ parts: [{ text: prompt }] }] 
                    })
                });

                if (!response.ok) {
                    const errorJson = await response.json();
                    throw new Error(errorJson.error?.message || "Connection Error");
                }

                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (text) {
                    const formatted = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    const id = "out-" + Math.random().toString(36).substr(2, 9);
                    outputElement.innerHTML = `
                        <div class="bg-white border-2 border-indigo-100 p-8 rounded-3xl shadow-sm relative">
                            <button onclick="app.speakText(document.getElementById('${id}').innerText)" class="mb-4 text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-800 tracking-tighter">🔊 Listen to AI Tutor</button>
                            <div id="${id}" class="text-slate-700 text-sm leading-loose">${formatted}</div>
                        </div>`;
                } else {
                    outputElement.innerHTML = `<div class="p-6 bg-amber-50 text-amber-700 rounded-2xl text-xs font-bold italic">Identity Shielding: No response generated. Check your PRF constraints.</div>`;
                }
            } catch (e) {
                outputElement.innerHTML = `<div class="p-6 bg-red-50 text-red-600 rounded-2xl text-xs font-bold italic">Thermodynamic Failure: ${e.message}</div>`;
            }
        },

        setupEventListeners() {
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    document.getElementById('welcome-screen').classList.add('hidden');
                    document.getElementById('app-container').classList.remove('hidden');
                    window.scrollTo(0,0);
                });
            }

            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetId = btn.id.replace('-tab', '-section');
                    document.querySelectorAll('[role="tabpanel"]').forEach(p => p.classList.add('hidden'));
                    const section = document.getElementById(targetId);
                    if (section) section.classList.remove('hidden');
                    
                    document.querySelectorAll('.tab-btn').forEach(b => {
                        b.setAttribute('aria-selected', 'false');
                        b.className = "tab-btn flex-1 min-w-[150px] px-4 py-3 font-bold text-sm rounded-xl transition-all text-slate-500 hover:bg-slate-50";
                    });
                    btn.setAttribute('aria-selected', 'true');
                    btn.className = "tab-btn flex-1 min-w-[150px] px-4 py-3 font-black text-sm rounded-xl transition-all bg-indigo-600 text-white shadow-lg";
                });
            });

            document.getElementById('settings-btn').onclick = () => document.getElementById('settings-api-key-modal').classList.remove('hidden');
            document.getElementById('cancel-api-key-btn').onclick = () => document.getElementById('settings-api-key-modal').classList.add('hidden');
            document.getElementById('save-api-key-btn').onclick = () => {
                this.apiKey = document.getElementById('api-key-input-settings').value.trim();
                localStorage.setItem('ethical_cartography_key', this.apiKey);
                document.getElementById('settings-api-key-modal').classList.add('hidden');
                location.reload(); 
            };

            document.querySelectorAll('.card-container').forEach(c => c.onclick = e => this.handleCardClick(e));
            document.getElementById('find-counterparts-btn').onclick = () => this.handleResonanceLab();
            document.getElementById('resonance-send-btn').onclick = () => this.handleResonanceChat();
        },

        handleCardClick(e) {
            const card = e.target.closest('article');
            if (!card) return;
            const type = card.dataset.type;
            const index = card.dataset.index;
            let data = (type === 'navigator') ? appData.navigators[index] : 
                       (type === 'thinker') ? appData.thinkers[index] :
                       (type === 'foundation') ? appData.foundations[index] : appData.caseStudies[index];
            this.showDetailModal(data, type);
        },

        showDetailModal(data, type) {
            const el = document.getElementById('modal-content-details');
            const modal = document.getElementById('detail-modal');
            this.currentModalFigure = (type === 'navigator' || type === 'thinker') ? data : null;
            el.innerHTML = this.currentModalFigure ? this.getPersonHtml(data) : this.getSimpleHtml(data);
            modal.classList.remove('hidden');
            if (this.currentModalFigure) document.getElementById('modal-chat-send').onclick = () => this.handleModalChat();
        },

        getPersonHtml(data) {
            return `
                <div class="mb-10 text-center"><h2 id="modal-title" class="text-4xl font-black mb-2">${data.name}</h2><p class="text-indigo-600 font-bold uppercase tracking-widest text-xs">${data.title}</p></div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div class="space-y-6">
                        <section><h4 class="text-[10px] font-black uppercase text-slate-400 mb-2">Phenomenal Reference Frame (PRF) [cite: 1159]</h4><div class="text-slate-700 text-sm leading-relaxed">${data.broa}</div></section>
                        <section><h4 class="text-[10px] font-black uppercase text-slate-400 mb-2">Temporal Coherence (ATCF) [cite: 764]</h4><p class="text-slate-700 text-sm italic">${data.atcf}</p></section>
                    </div>
                    <div class="bg-indigo-50 p-8 rounded-3xl">
                        <h4 class="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest">Lab Simulation: Speak with Navigator</h4>
                        <div id="modal-chat-output" class="text-xs mb-6 space-y-4 max-h-60 overflow-y-auto"></div>
                        <div class="flex gap-2 p-2 bg-white rounded-2xl shadow-inner">
                            <input type="text" id="modal-chat-input" class="flex-1 bg-transparent border-none focus:ring-0 p-2 text-sm" placeholder="Ask about their PRF or choices...">
                            <button id="modal-chat-send" class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold">SEND</button>
                        </div>
                    </div>
                </div>`;
        },

        getSimpleHtml(data) {
            return `<h2 id="modal-title" class="text-3xl font-black mb-4">${data.title}</h2><div class="prose text-slate-600 text-sm max-w-none">${data.content || data.analysis || data.summary}</div>`;
        },

        async handleResonanceLab() {
            const input = document.getElementById('resonance-input').value;
            if (!input) return;
            const prompt = `${this.frameworkContext}\nStudent PRF Reflection: "${input}"\nIdentify role models and explain functional equivalence through BROA+ and ATCF metrics. [cite: 88, 222, 2505]`;
            await this.callGeminiAPI(prompt, document.getElementById('counterparts-output'));
            document.getElementById('resonance-chat-container').classList.remove('hidden');
        },

        handleModalChat() {
            const inputEl = document.getElementById('modal-chat-input');
            const out = document.getElementById('modal-chat-output');
            const question = inputEl.value;
            if (!question) return;

            const prompt = `SIMULATION: You are ${this.currentModalFigure.name}. Answer this student through your Phenomenal Reference Frame (PRF) and historical context: "${question}". Address their multi-scale coherence (BROA+). [cite: 181, 1181]`;
            
            const turn = document.createElement('div');
            turn.innerHTML = `<div class="p-3 bg-indigo-100 rounded-xl mb-2 font-bold">${question}</div><div class="ai-box"></div>`;
            out.appendChild(turn);
            this.callGeminiAPI(prompt, turn.querySelector('.ai-box'));
            inputEl.value = "";
        },

        handleResonanceChat() {
            const input = document.getElementById('resonance-chat-input');
            const turn = document.createElement('div');
            turn.innerHTML = `<div class="p-4 bg-indigo-600 text-white rounded-2xl mb-4 font-bold">${input.value}</div><div class="ai-box"></div>`;
            document.getElementById('counterparts-output').appendChild(turn);
            this.callGeminiAPI(input.value, turn.querySelector('.ai-box'));
            input.value = "";
        }
    };

    app.init();
});

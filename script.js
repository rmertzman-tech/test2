document.addEventListener('DOMContentLoaded', () => {

    window.app = {
        apiKey: localStorage.getItem('ethical_cartography_key') || "",
        currentModalFigure: null,

        // CONTEXT: Ethics in an Entropic World
        frameworkContext: `
            You are the 'Ethical Cartography' AI Tutor. 
            CORE ONTOLOGY:
            - PRF stands for **Phenomenal Reference Frame**. It is the agent's lived horizon of meaning.
            - Multi-Scale Coherence (BROA+): Agency requires Biological (BRC), Identity (KIC), Cognitive (CIC), Institutional (ISC), and Temporal (TNC) alignment.
            - ATCF: Measure of narrative and prospective integrity.
            - Landauer Principle: Ethical overwriting has a metabolic/informational cost.
            TASK: Map functional equivalents and evaluate coherence stability.
        `,

        init() {
            this.setupEventListeners();
            this.renderAllContent();
            if (this.apiKey) {
                document.getElementById('api-key-input-settings').value = this.apiKey;
            }
        },

        speakText(text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
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
        },

        createCardHtml(item, type, index) {
            const color = type === 'navigator' ? 'indigo' : 'teal';
            return `
                <article role="button" tabindex="0" class="profile-card bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl transition-all cursor-pointer flex flex-col" data-type="${type}" data-index="${index}">
                    <h3 class="text-2xl font-black text-slate-900 leading-tight mb-1">${item.name}</h3>
                    <p class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">${item.lifespan}</p>
                    <p class="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6">${item.summary}</p>
                    <div class="mt-auto pt-4 border-t border-slate-50 text-indigo-600 font-black text-[10px] uppercase tracking-tighter">Enter Phenomenal Frame →</div>
                </article>`;
        },

        createSimpleCardHtml(item, type, index) {
            return `
                <article role="button" tabindex="0" class="simple-card bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all cursor-pointer" data-type="${type}" data-index="${index}">
                      <h3 class="text-xl font-black text-slate-900 mb-2">${item.title}</h3>
                      <p class="text-slate-500 text-xs leading-relaxed">${item.summary}</p>
                </article>`;
        },

        async callGeminiAPI(prompt, outputElement) {
            if (!this.apiKey) {
                outputElement.innerHTML = `<div class="p-6 bg-red-50 text-red-700 rounded-2xl font-black uppercase text-xs">⚠️ Setup Required: Add API Key in Settings</div>`;
                return;
            }

            outputElement.innerHTML = `<div class="flex items-center gap-4 p-8 bg-indigo-50 rounded-3xl animate-pulse">
                <div class="loader-vivid"></div><span class="text-indigo-800 font-black text-sm uppercase tracking-widest">Resolving Coherence Architecture...</span>
            </div>`;

            try {
                // FIXED ENDPOINT TO V1BETA
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error?.message || "Connection Error");

                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    const formatted = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    const turnId = "audio-" + Math.random().toString(36).substr(2, 9);
                    outputElement.innerHTML = `
                        <div class="bg-white border-2 border-indigo-100 p-8 rounded-[2rem] shadow-sm relative">
                            <button onclick="app.speakText(document.getElementById('${turnId}').innerText)" class="mb-4 text-[10px] font-black text-indigo-500 uppercase flex items-center gap-2 hover:text-indigo-800">
                                🔊 Hear Synthesis
                            </button>
                            <div id="${turnId}" class="text-slate-700 text-sm leading-loose">${formatted}</div>
                        </div>`;
                    outputElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } catch (e) {
                outputElement.innerHTML = `<div class="p-8 bg-red-50 text-red-600 rounded-3xl text-sm font-bold border-2 border-red-100">
                    <strong>Thermodynamic Failure:</strong> ${e.message}<br><br>
                    <span class="text-xs opacity-75 font-normal uppercase">Suggestion: Ensure your API Key is valid and the Gemini 1.5 Flash model is enabled in your Google AI Studio project.</span>
                </div>`;
            }
        },

        setupEventListeners() {
            document.getElementById('start-btn').onclick = () => {
                document.getElementById('welcome-screen').classList.add('hidden');
                document.getElementById('app-container').classList.remove('hidden');
                window.scrollTo(0,0);
            };

            const tabBtns = document.querySelectorAll('.tab-btn');
            tabBtns.forEach(btn => {
                btn.onclick = () => {
                    const target = btn.id.replace('-tab', '-section');
                    document.querySelectorAll('[role="tabpanel"]').forEach(p => p.classList.add('hidden'));
                    document.getElementById(target).classList.remove('hidden');
                    tabBtns.forEach(b => {
                        b.setAttribute('aria-selected', 'false');
                        b.className = "tab-btn px-6 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all text-slate-400 hover:bg-slate-100";
                    });
                    btn.setAttribute('aria-selected', 'true');
                    btn.className = "tab-btn px-6 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all bg-indigo-700 text-white shadow-xl";
                };
            });

            document.getElementById('settings-btn').onclick = () => document.getElementById('settings-api-key-modal').classList.remove('hidden');
            document.getElementById('cancel-api-key-btn').onclick = () => document.getElementById('settings-api-key-modal').classList.add('hidden');
            document.getElementById('save-api-key-btn').onclick = () => {
                this.apiKey = document.getElementById('api-key-input-settings').value.trim();
                localStorage.setItem('ethical_cartography_key', this.apiKey);
                location.reload(); 
            };

            document.querySelectorAll('.card-container').forEach(c => c.onclick = e => this.handleCardClick(e));
            document.getElementById('find-counterparts-btn').onclick = () => this.handleResonanceLab();
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
                <div class="mb-12 text-center">
                    <h2 class="text-5xl font-black text-slate-900 mb-2">${data.name}</h2>
                    <p class="text-indigo-600 font-black uppercase tracking-widest text-xs">${data.title}</p>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div class="space-y-8">
                        <section><h4 class="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Assembly History</h4><div class="text-slate-700 text-sm bg-slate-50 p-6 rounded-3xl border-l-8 border-indigo-500">${data.assemblyHistory}</div></section>
                        <section><h4 class="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Phenomenal Frame (BROA+)</h4><div class="text-slate-700 text-sm leading-relaxed">${data.broa}</div></section>
                        <section><h4 class="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">ATCF Metric</h4><p class="text-slate-500 text-sm italic">${data.atcf}</p></section>
                    </div>
                    <div class="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative">
                        <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Live Simulation</div>
                        <div id="modal-chat-output" class="text-sm mb-8 space-y-4 max-h-[400px] overflow-y-auto pr-4"></div>
                        <div class="flex gap-2 p-3 bg-white/10 rounded-2xl border border-white/20">
                            <input type="text" id="modal-chat-input" class="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-indigo-300" placeholder="Ask about their choices...">
                            <button id="modal-chat-send" class="bg-white text-indigo-900 px-6 py-3 rounded-xl font-black hover:bg-indigo-100 transition-colors">SEND</button>
                        </div>
                    </div>
                </div>`;
        },

        getSimpleHtml(data) {
            return `<h2 class="text-4xl font-black mb-6">${data.title}</h2><div class="prose prose-indigo max-w-none text-slate-600">${data.content || data.analysis || data.summary}</div>`;
        },

        async handleResonanceLab() {
            const input = document.getElementById('resonance-input').value;
            if (!input) return;
            const prompt = `${this.frameworkContext}\nStudent PRF: "${input}"\nIdentify 3 role models and explain Functional Equivalence using BROA+ and ATCF terms.`;
            await this.callGeminiAPI(prompt, document.getElementById('counterparts-output'));
        },

        handleModalChat() {
            const input = document.getElementById('modal-chat-input');
            if (!input.value) return;
            const prompt = `SIMULATION: Respond AS ${this.currentModalFigure.name}. Answer through your PRF: "${input.value}"`;
            const turn = document.createElement('div');
            turn.innerHTML = `<div class="p-4 bg-white/5 rounded-2xl border border-white/10 font-bold text-indigo-200">Q: ${input.value}</div><div class="ai-box mt-4"></div>`;
            document.getElementById('modal-chat-output').appendChild(turn);
            this.callGeminiAPI(prompt, turn.querySelector('.ai-box'));
            input.value = "";
        }
    };
    app.init();
});

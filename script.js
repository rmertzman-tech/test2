document.addEventListener('DOMContentLoaded', () => {

    window.app = {
        apiKey: localStorage.getItem('ethical_cartography_key') || "",
        currentModalFigure: null,

        frameworkContext: `
            You are the 'Ethical Cartography' AI Tutor, an expert in Constructor Ethics.
            1. PRF = Phenomenal Reference Frame (Lived horizon of meaning).
            2. Multi-Scale Coherence (BROA+): Agency requires Biological, Identity, Cognitive, Institutional, and Temporal alignment.
            3. ATCF: Adaptive Temporal Coherence Function (At, Tt, Ct, Ft).
            4. Thermodynamic Ethics: Ethical action has a metabolic/informational cost (Landauer's Principle).
            5. Sapolsky Function: Stress causing prefrontal/temporal collapse.
            Help students map functional equivalents using BROA+ metrics.
        `,

        init() {
            this.setupEventListeners();
            try {
                this.renderAllContent();
            } catch (e) {
                console.error("Content Rendering Decoherence:", e);
            }
            if (this.apiKey) {
                const welcomeInput = document.getElementById('api-key-input-welcome');
                if (welcomeInput) welcomeInput.value = this.apiKey;
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
            const color = type === 'navigator' ? 'indigo' : 'teal';
            return `
                <article role="button" data-type="${type}" data-index="${index}" class="profile-card bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl transition-all cursor-pointer flex flex-col">
                    <h3 class="text-2xl font-black text-slate-900 leading-tight mb-1">${item.name}</h3>
                    <p class="text-[10px] font-black text-${color}-500 uppercase tracking-widest mb-4">${item.lifespan}</p>
                    <p class="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6">${item.summary}</p>
                    <div class="mt-auto pt-4 border-t border-slate-50 text-${color}-600 font-black text-[10px] uppercase tracking-tighter">Analyze PRF →</div>
                </article>`;
        },

        createSimpleCardHtml(item, type, index) {
            return `
                <article role="button" data-type="${type}" data-index="${index}" class="simple-card bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all cursor-pointer">
                      <h3 class="text-xl font-black text-slate-900 mb-2">${item.title}</h3>
                      <p class="text-slate-500 text-xs leading-relaxed line-clamp-3">${item.summary}</p>
                </article>`;
        },

        // --- THE FETCH REPAIR ---
        async callGeminiAPI(prompt, outputElement) {
            if (!this.apiKey) {
                outputElement.innerHTML = `<div class="p-6 bg-red-50 text-red-700 rounded-2xl font-black uppercase text-xs">⚠️ Missing API Key.</div>`;
                return;
            }

            outputElement.innerHTML = `
                <div class="flex items-center gap-4 p-8 bg-indigo-50 rounded-3xl animate-pulse">
                    <span class="text-indigo-800 font-black text-sm uppercase tracking-widest italic">Resolving Coherence Architecture...</span>
                </div>`;

            try {
                // Using the specific v1beta endpoint which handles 1.5-flash most reliably
                const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
                const url = `${endpoint}?key=${this.apiKey}`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        contents: [{ parts: [{ text: prompt }] }] 
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error?.message || `HTTP Error ${response.status}`);
                }

                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    const formatted = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    const turnId = "speech-" + Math.random().toString(36).substr(2, 9);
                    outputElement.innerHTML = `
                        <div class="bg-white border-2 border-indigo-100 p-8 rounded-[2rem] shadow-sm">
                            <button onclick="app.speakText(document.getElementById('${turnId}').innerText)" class="mb-4 text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-800 tracking-tighter">🔊 Listen to AI Tutor</button>
                            <div id="${turnId}" class="text-slate-700 text-sm leading-relaxed">${formatted}</div>
                        </div>`;
                }
            } catch (e) {
                console.error("API Failure:", e);
                outputElement.innerHTML = `<div class="p-8 bg-red-50 text-red-600 rounded-3xl text-xs font-bold uppercase tracking-tighter border-2 border-red-100">
                    Thermodynamic Failure: ${e.message}<br><br>
                    <span class="normal-case opacity-75">Check: 1. API Key Validity 2. Internet Connection 3. Google AI Studio project status.</span>
                </div>`;
            }
        },

        setupEventListeners() {
            const startBtn = document.getElementById('start-btn');
            const welcome = document.getElementById('welcome-screen');
            const lab = document.getElementById('app-container');
            const keyInput = document.getElementById('api-key-input-welcome');

            if (startBtn) {
                startBtn.onclick = () => {
                    const val = keyInput.value.trim();
                    if (!val) { alert("Please enter your API Key."); return; }
                    this.apiKey = val;
                    localStorage.setItem('ethical_cartography_key', val);
                    welcome.classList.add('hidden');
                    lab.classList.remove('hidden');
                    window.scrollTo(0,0);
                };
            }

            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.onclick = () => {
                    const target = btn.id.replace('-tab', '-section');
                    document.querySelectorAll('[role="tabpanel"]').forEach(p => p.classList.add('hidden'));
                    const section = document.getElementById(target);
                    if (section) section.classList.remove('hidden');
                    document.querySelectorAll('.tab-btn').forEach(b => {
                        b.setAttribute('aria-selected', 'false');
                        b.className = "tab-btn px-6 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all text-slate-400 hover:bg-white";
                    });
                    btn.setAttribute('aria-selected', 'true');
                    btn.className = "tab-btn px-6 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all bg-indigo-700 text-white shadow-xl";
                };
            });

            document.getElementById('reset-key-btn').onclick = () => {
                lab.classList.add('hidden');
                welcome.classList.remove('hidden');
            };

            document.getElementById('main-content-area').onclick = e => {
                const article = e.target.closest('article');
                if (!article) return;
                const type = article.dataset.type;
                const index = article.dataset.index;
                let data = (type === 'navigator') ? appData.navigators[index] : 
                           (type === 'thinker') ? appData.thinkers[index] :
                           (type === 'foundation') ? appData.foundations[index] : appData.caseStudies[index];
                this.showDetailModal(data, type);
            };

            document.getElementById('find-counterparts-btn').onclick = () => this.handleResonanceLab();
            document.getElementById('close-modal').onclick = () => {
                document.getElementById('detail-modal').classList.add('hidden');
                window.speechSynthesis.cancel();
            };
        },

        showDetailModal(data, type) {
            const el = document.getElementById('modal-content-details');
            const modal = document.getElementById('detail-modal');
            this.currentModalFigure = (type === 'navigator' || type === 'thinker') ? data : null;
            el.innerHTML = this.currentModalFigure ? this.getPersonHtml(data) : this.getSimpleHtml(data);
            modal.classList.remove('hidden');
            if (this.currentModalFigure) {
                document.getElementById('modal-chat-send').onclick = () => this.handleModalChat();
            }
        },

        getPersonHtml(data) {
            return `
                <div class="mb-12 text-center">
                    <h2 class="text-5xl font-black text-slate-900 mb-2">${data.name}</h2>
                    <p class="text-indigo-600 font-black uppercase tracking-widest text-xs">${data.title}</p>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div class="space-y-8 pr-4">
                        <section><h4 class="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Assembly History</h4><div class="text-slate-700 text-sm bg-slate-50 p-6 rounded-3xl border-l-8 border-indigo-500">${data.assemblyHistory}</div></section>
                        <section><h4 class="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Phenomenal Frame (PRF)</h4><div class="text-slate-700 text-sm leading-relaxed">${data.broa}</div></section>
                    </div>
                    <div class="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative">
                        <div id="modal-chat-output" class="text-sm mb-8 space-y-4 max-h-[400px] overflow-y-auto pr-4"></div>
                        <div class="flex gap-2 p-3 bg-white/10 rounded-2xl border border-white/20">
                            <input type="text" id="modal-chat-input" class="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-indigo-300 text-sm" placeholder="Ask a question...">
                            <button id="modal-chat-send" class="bg-white text-indigo-900 px-6 py-3 rounded-xl font-black">SEND</button>
                        </div>
                    </div>
                </div>`;
        },

        getSimpleHtml(data) {
            return `<h2 class="text-4xl font-black mb-6">${data.title}</h2><div class="prose prose-indigo max-w-none text-slate-600 text-sm">${data.content || data.analysis || data.summary}</div>`;
        },

        async handleResonanceLab() {
            const input = document.getElementById('resonance-input').value;
            if (!input) return;
            const prompt = `${this.frameworkContext}\nStudent PRF Reflection: "${input}"\nIdentify 3 role models and explain Functional Equivalence using multi-scale coherence terms.`;
            await this.callGeminiAPI(prompt, document.getElementById('counterparts-output'));
        },

        handleModalChat() {
            const inputEl = document.getElementById('modal-chat-input');
            const question = inputEl.value;
            if (!question) return;
            const turn = document.createElement('div');
            turn.innerHTML = `<div class="p-4 bg-white/5 rounded-2xl border border-white/10 font-bold text-indigo-200">Q: ${question}</div><div class="ai-box mt-4"></div>`;
            document.getElementById('modal-chat-output').appendChild(turn);
            const prompt = `SIMULATION: Respond AS ${this.currentModalFigure.name}. Question through PRF: "${question}"`;
            this.callGeminiAPI(prompt, turn.querySelector('.ai-box'));
            inputEl.value = "";
        }
    };
    app.init();
});

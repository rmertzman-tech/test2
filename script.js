document.addEventListener('DOMContentLoaded', () => {

    window.app = {
        apiKey: localStorage.getItem('ethical_cartography_key') || "",
        currentModalFigure: null,

        // CONTEXT: Ethics in an Entropic World (v2.5 architecture)
        frameworkContext: `
            You are the 'Ethical Cartography' AI Tutor. 
            CORE TERMINOLOGY:
            - PRF stands for **Phenomenal Reference Frame**.
            - Multi-Scale Coherence (BROA+): Biological (BRC), Identity (KIC), Cognitive (CIC), Institutional (ISC), and Temporal (TNC).
            - ATCF: Measure of narrative and prospective integrity (At, Tt, Ct, Ft).
            - Landauer Principle: Metabolic cost of ethical overwriting.
            TASK: Map functional equivalents using these multi-scale coherence metrics.
        `,

        init() {
            this.setupEventListeners();
            try { this.renderAllContent(); } catch (e) { console.error("Render Decoherence:", e); }
            if (this.apiKey) {
                document.getElementById('api-key-input-welcome').value = this.apiKey;
            }
        },

        async callGeminiAPI(prompt, outputElement) {
            if (!this.apiKey) {
                outputElement.innerHTML = `<div class="p-6 bg-red-50 text-red-700 rounded-2xl font-black uppercase text-xs">⚠️ Setup Required: Add API Key</div>`;
                return;
            }

            outputElement.innerHTML = `<div class="p-8 bg-indigo-50 rounded-3xl animate-pulse text-center">
                <span class="text-indigo-800 font-black text-sm uppercase tracking-widest italic">Resolving Coherence Architecture (v2.5)...</span>
            </div>`;

            try {
                // FIXED ENDPOINT: Explicitly using 2.5 Flash
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error?.message || "Connection Error");

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
            safeRender('navigators-section', appData.navigators, (item, i) => this.createCardHtml(item, 'navigator', i));
            safeRender('thinkers-section', appData.thinkers, (item, i) => this.createCardHtml(item, 'thinker', i));
            safeRender('foundations-section', appData.foundations, (item, i) => this.createSimpleCardHtml(item, 'foundation', i));
            safeRender('casestudies-section', appData.caseStudies, (item, i) => this.createSimpleCardHtml(item, 'casestudy', i));
        },

        setupEventListeners() {
            document.getElementById('start-btn').onclick = () => {
                const key = document.getElementById('api-key-input-welcome').value.trim();
                if (!key) { alert("Please enter your API Key."); return; }
                this.apiKey = key;
                localStorage.setItem('ethical_cartography_key', key);
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
                        b.className = "tab-btn px-6 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all text-slate-400 hover:bg-white";
                    });
                    btn.setAttribute('aria-selected', 'true');
                    btn.className = "tab-btn px-6 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all bg-indigo-700 text-white shadow-xl";
                };
            });

            document.getElementById('reset-key-btn').onclick = () => location.reload();

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
        },

        showDetailModal(data, type) {
            const el = document.getElementById('modal-content-details');
            const modal = document.getElementById('detail-modal');
            this.currentModalFigure = (type === 'navigator' || type === 'thinker') ? data : null;
            el.innerHTML = this.currentModalFigure ? this.getPersonHtml(data) : this.getSimpleHtml(data);
            modal.classList.remove('hidden');
            document.getElementById('close-modal').onclick = () => modal.classList.add('hidden');
            if (this.currentModalFigure) document.getElementById('modal-chat-send').onclick = () => this.handleModalChat();
        },

        getPersonHtml(data) {
            return `
                <div class="mb-12 text-center"><h2 class="text-5xl font-black mb-2">${data.name}</h2><p class="text-indigo-600 font-black uppercase tracking-widest text-[10px]">${data.title}</p></div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div class="space-y-8 pr-4 text-sm leading-relaxed">
                        <section><h4 class="text-[10px] font-black uppercase text-slate-400 mb-2">Phenomenal Frame (PRF)</h4><div class="bg-slate-50 p-6 rounded-3xl border-l-8 border-indigo-500">${data.broa}</div></section>
                        <section><h4 class="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest text-slate-500">Temporal Horizon (ATCF)</h4><p class="italic">${data.atcf}</p></section>
                    </div>
                    <div class="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative">
                        <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest tracking-tighter">Live Synthesis</div>
                        <div id="modal-chat-output" class="text-xs mb-8 space-y-4 max-h-[350px] overflow-y-auto pr-4 font-medium"></div>
                        <div class="flex gap-2 p-2 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
                            <input type="text" id="modal-chat-input" class="flex-1 bg-transparent border-none focus:ring-0 text-white text-sm" placeholder="Ask through PRF...">
                            <button id="modal-chat-send" class="bg-white text-indigo-900 px-6 py-2 rounded-xl font-black uppercase text-[10px] hover:bg-indigo-100">Send</button>
                        </div>
                    </div>
                </div>`;
        },

        getSimpleHtml(data) {
            return `<h2 class="text-4xl font-black mb-6 text-indigo-900">${data.title}</h2><div class="prose text-slate-600 text-sm leading-relaxed">${data.content || data.analysis || data.summary}</div>`;
        },

        async handleResonanceLab() {
            const input = document.getElementById('resonance-input').value;
            if (!input) return;
            const prompt = `${this.frameworkContext}\nSTUDENT PRF REFLECTION: "${input}"\nIdentify role models and explain functional equivalence through multi-scale coherence terms.`;
            await this.callGeminiAPI(prompt, document.getElementById('counterparts-output'));
        },

        handleModalChat() {
            const input = document.getElementById('modal-chat-input');
            const prompt = `SIMULATION: Respond AS ${this.currentModalFigure.name}. Question through PRF: "${input.value}"`;
            const turn = document.createElement('div');
            turn.innerHTML = `<div class="p-3 bg-white/5 rounded-xl border border-white/10 font-bold text-indigo-200">Q: ${input.value}</div><div class="ai-box mt-3 text-white/90"></div>`;
            document.getElementById('modal-chat-output').appendChild(turn);
            this.callGeminiAPI(prompt, turn.querySelector('.ai-box'));
            input.value = "";
        },

        createCardHtml(item, type, index) {
            const color = type === 'navigator' ? 'indigo' : 'teal';
            return `
                <article role="button" data-type="${type}" data-index="${index}" class="profile-card bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl transition-all cursor-pointer flex flex-col">
                    <h3 class="text-2xl font-black text-slate-900 leading-tight mb-1">${item.name}</h3>
                    <p class="text-[10px] font-black text-${color}-500 uppercase tracking-widest mb-4">${item.lifespan}</p>
                    <p class="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6">${item.summary}</p>
                    <div class="mt-auto pt-4 border-t border-slate-50 text-${color}-600 font-black text-[10px] uppercase tracking-tighter">Enter Phenomenal Frame →</div>
                </article>`;
        },

        createSimpleCardHtml(item, type, index) {
            return `<article role="button" data-type="${type}" data-index="${index}" class="simple-card bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all cursor-pointer flex flex-col">
                      <h3 class="text-xl font-black text-slate-900 mb-2">${item.title}</h3>
                      <p class="text-slate-500 text-xs leading-relaxed line-clamp-3">${item.summary}</p>
                    </article>`;
        }
    };
    app.init();
});

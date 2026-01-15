document.addEventListener('DOMContentLoaded', () => {

    window.app = {
        apiKey: localStorage.getItem('ethical_cartography_key') || "",
        currentModalFigure: null,

        // Updated framework context with 2026 'Ethics in an Entropic World' logic
        frameworkContext: `
            You are the 'Ethical Cartography' AI Tutor. 
            PRF = Phenomenal Reference Frame.
            ATCF = Adaptive Temporal Coherence Function.
            Sapolsky Function = Chronic stress causing temporal collapse.
            Landauer Principle = Energetic cost of ethical overwriting.
            Help students map functional equivalents using BROA+ and multi-scale coherence metrics.
        `,

        init() {
            console.log("Lab Initialization: Re-Bootstrapping Coherence...");
            this.setupEventListeners();
            
            // Check if appData exists before trying to render
            if (typeof appData !== 'undefined') {
                this.renderAllContent();
            } else {
                alert("Decoherence Error: 'data.js' was not detected. Ensure the file is in the same folder.");
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

        // --- FIXED RENDERING LOGIC ---
        renderAllContent() {
            const safeRender = (id, data, htmlFunc) => {
                const el = document.getElementById(id);
                if (el && data) {
                    el.innerHTML = data.map((item, index) => htmlFunc.call(this, item, index)).join('');
                    console.log(`Successfully rendered ${data.length} items to #${id}`);
                } else {
                    console.error(`Target ID #${id} not found or data missing.`);
                }
            };

            // These IDs MUST match the inner grids in your HTML
            safeRender('profile-grid', appData.navigators, (item, i) => this.createCardHtml(item, 'navigator', i));
            safeRender('thinker-grid', appData.thinkers, (item, i) => this.createCardHtml(item, 'thinker', i));
            safeRender('foundation-grid', appData.foundations, (item, i) => this.createSimpleCardHtml(item, 'foundation', i));
            safeRender('casestudy-grid', appData.caseStudies, (item, i) => this.createSimpleCardHtml(item, 'casestudy', i));
            
            const discEl = document.getElementById('disclaimer-text');
            if(discEl && appData.disclaimerText) discEl.textContent = appData.disclaimerText;
        },

        createCardHtml(item, type, index) {
            const accent = type === 'navigator' ? 'indigo' : 'teal';
            return `
                <article role="button" data-type="${type}" data-index="${index}" 
                         class="profile-card bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all cursor-pointer flex flex-col">
                    <h3 class="text-2xl font-black text-slate-900 leading-tight mb-1">${item.name}</h3>
                    <p class="text-[10px] font-black text-${accent}-500 uppercase tracking-widest mb-4">${item.lifespan}</p>
                    <p class="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6">${item.summary}</p>
                    <div class="mt-auto pt-4 border-t border-slate-50 text-${accent}-600 font-black text-[10px] uppercase tracking-tighter">Analyze PRF →</div>
                </article>`;
        },

        createSimpleCardHtml(item, type, index) {
            const accent = type === 'foundation' ? 'slate' : 'amber';
            return `
                <article role="button" data-type="${type}" data-index="${index}" 
                         class="simple-card bg-white p-8 rounded-[2rem] shadow-sm border border-${accent}-100 hover:shadow-xl transition-all cursor-pointer">
                      <h3 class="text-xl font-black text-slate-900 mb-2">${item.title}</h3>
                      <p class="text-slate-500 text-xs leading-relaxed line-clamp-3">${item.summary}</p>
                </article>`;
        },

        async callGeminiAPI(prompt, outputElement) {
            if (!this.apiKey) {
                outputElement.innerHTML = `<div class="p-6 bg-red-50 text-red-700 rounded-2xl font-black uppercase text-xs">⚠️ Setup Required: Add API Key</div>`;
                return;
            }

            outputElement.innerHTML = `
                <div class="flex items-center gap-4 p-8 bg-indigo-50 rounded-3xl animate-pulse">
                    <span class="text-indigo-800 font-black text-sm uppercase tracking-widest italic">Resolving Coherence Architecture...</span>
                </div>`;

            try {
                // Endpoint version check for 2026 stability
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
                
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
                    const turnId = "audio-" + Math.random().toString(36).substr(2, 9);
                    outputElement.innerHTML = `
                        <div class="bg-white border-2 border-indigo-100 p-8 rounded-[2rem] shadow-sm relative">
                            <button onclick="app.speakText(document.getElementById('${turnId}').innerText)" 
                                    class="mb-4 text-[10px] font-black text-indigo-500 uppercase flex items-center gap-2 hover:text-indigo-800">
                                🔊 Listen to Synthesis
                            </button>
                            <div id="${turnId}" class="text-slate-700 text-sm leading-loose">${formatted}</div>
                        </div>`;
                    outputElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } catch (e) {
                outputElement.innerHTML = `<div class="p-8 bg-red-50 text-red-600 rounded-3xl text-sm font-bold border-2 border-red-100">
                    Thermodynamic Failure: ${e.message}
                </div>`;
            }
        },

        setupEventListeners() {
            // Enter Lab
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                startBtn.onclick = () => {
                    const val = document.getElementById('api-key-input-welcome').value.trim();
                    if (!val) { alert("Please enter your API Key to initialize the lab."); return; }
                    this.apiKey = val;
                    localStorage.setItem('ethical_cartography_key', val);
                    document.getElementById('welcome-screen').classList.add('hidden');
                    document.getElementById('app-container').classList.remove('hidden');
                };
            }

            // Tabs
            const tabBtns = document.querySelectorAll('.tab-btn');
            tabBtns.forEach(btn => {
                btn.onclick = () => {
                    const targetId = btn.id.replace('-tab', '-section');
                    document.querySelectorAll('[role="tabpanel"]').forEach(p => p.classList.add('hidden'));
                    const section = document.getElementById(targetId);
                    if (section) section.classList.remove('hidden');
                    
                    tabBtns.forEach(b => {
                        b.setAttribute('aria-selected', 'false');
                        b.classList.remove('bg-indigo-700', 'text-white', 'shadow-xl');
                        b.classList.add('text-slate-400');
                    });
                    btn.setAttribute('aria-selected', 'true');
                    btn.classList.add('bg-indigo-700', 'text-white', 'shadow-xl');
                    btn.classList.remove('text-slate-400');
                };
            });

            // Card Clicks (Targeting the Main Area)
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
            document.getElementById('reset-key-btn').onclick = () => location.reload();
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
                <div class="mb-12 text-center">
                    <h2 class="text-5xl font-black text-slate-900 mb-2">${data.name}</h2>
                    <p class="text-indigo-600 font-black uppercase tracking-widest text-xs">${data.title}</p>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div class="space-y-8 pr-4">
                        <section><h4 class="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Assembly History</h4><div class="text-slate-700 text-sm bg-slate-50 p-6 rounded-3xl border-l-8 border-indigo-500">${data.assemblyHistory}</div></section>
                        <section><h4 class="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Phenomenal Frame (PRF)</h4><div class="text-slate-700 text-sm leading-relaxed">${data.broa}</div></section>
                        <section><h4 class="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">ATCF Metric</h4><p class="text-slate-500 text-sm italic">${data.atcf}</p></section>
                    </div>
                    <div class="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative">
                        <div id="modal-chat-output" class="text-sm mb-8 space-y-4 max-h-[400px] overflow-y-auto pr-4"></div>
                        <div class="flex gap-2 p-3 bg-white/10 rounded-2xl border border-white/20">
                            <input type="text" id="modal-chat-input" class="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-indigo-300 text-sm" placeholder="Ask about their PRF...">
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
            const prompt = `${this.frameworkContext}\nStudent Reflection: "${input}"\nIdentify role models and explain Functional Equivalence using multi-scale coherence terms.`;
            await this.callGeminiAPI(prompt, document.getElementById('counterparts-output'));
        },

        handleModalChat() {
            const input = document.getElementById('modal-chat-input');
            if (!input.value) return;
            const prompt = `SIMULATION: Respond AS ${this.currentModalFigure.name}. Question through PRF: "${input.value}"`;
            const turn = document.createElement('div');
            turn.innerHTML = `<div class="p-4 bg-white/5 rounded-2xl border border-white/10 font-bold text-indigo-200">Q: ${input.value}</div><div class="ai-box mt-4"></div>`;
            document.getElementById('modal-chat-output').appendChild(turn);
            this.callGeminiAPI(prompt, turn.querySelector('.ai-box'));
            input.value = "";
        }
    };
    app.init();
});

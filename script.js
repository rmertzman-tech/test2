document.addEventListener('DOMContentLoaded', () => {

    window.app = {
        // API Key persistence
        apiKey: localStorage.getItem('ethical_cartography_key') || "",

        // UI State management
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

        // Knowledge Base updated with 'Ethics in an Entropic World'
        frameworkContext: `
            You are the 'Ethical Cartography' AI Tutor, an expert in Constructor Ethics.
            
            CORE PRINCIPLES:
            1. Phenomenal Reference Frame (PRF): The agent's lived horizon of meaning. Maintain Ontological Pluralism; the formalism is universal, but interpretation is plural.
            2. Multi-Scale Coherence (BROA+): Agency depends on Biological (BRC), Identity (KIC), Cognitive (CIC), Institutional (ISC), and Temporal (TNC) alignment.
            3. ATCF: A quadruple metric measuring Autobiographical (At), Present (Tt), Prospective (Ct), and Meta-Constructive (Ft) coherence.
            4. Thermodynamic Ethics: Agency is a thermodynamic achievement. Moral Debt is the load of unresolved contradictions. Entropy degrades the prefrontal cortex (Sapolsky Function).
            
            TASK: Help students map functional equivalents and resolve Moral Debt within their chosen PRF.
        `,

        init() {
            this.renderAllContent();
            this.setupEventListeners();
            
            if (this.apiKey) {
                const keyInput = document.getElementById('api-key-input-settings');
                if (keyInput) keyInput.value = this.apiKey;
            }
        },

        // --- ACCESSIBILITY: TEXT-TO-SPEECH (TTS) ---
        speakText(text) {
            window.speechSynthesis.cancel(); // Prevent overlapping audio
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9; // Slower for academic clarity
            utterance.pitch = 1.0;
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        },

        handleReadAloud(containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                const cleanText = container.innerText || container.textContent;
                this.speakText(cleanText);
            }
        },

        // --- CONTENT RENDERING ---
        renderAllContent() {
            document.getElementById('profile-grid').innerHTML = this.navigators.map((item, index) => this.createCardHtml(item, 'navigator', index)).join('');
            document.getElementById('thinker-grid').innerHTML = this.thinkers.map((item, index) => this.createCardHtml(item, 'thinker', index)).join('');
            document.getElementById('concept-grid').innerHTML = this.concepts.map((item, index) => this.createConceptCardHtml(item, index)).join('');
            document.getElementById('foundation-grid').innerHTML = this.foundations.map((item, index) => this.createSimpleCardHtml(item, 'foundation', index)).join('');
            document.getElementById('casestudy-grid').innerHTML = this.caseStudies.map((item, index) => this.createSimpleCardHtml(item, 'casestudy', index)).join('');
            document.getElementById('essay-grid').innerHTML = this.essays.map((item, index) => this.createSimpleCardHtml(item, 'essay', index)).join('');
            
            const disclaimerEl = document.getElementById('disclaimer-text');
            if(disclaimerEl && appData.disclaimerText) disclaimerEl.textContent = appData.disclaimerText;

            this.renderComparisonLab();
        },
        
        createCardHtml(item, type, index) {
            const colors = { navigator: 'text-indigo-700', thinker: 'text-teal-700' };
            return `
                <article role="button" tabindex="0" class="profile-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer flex flex-col" 
                         data-type="${type}" data-index="${index}" aria-label="${item.name}, ${item.title}">
                    <h3 class="text-xl font-bold ${colors[type]}">${item.name}</h3>
                    <p class="text-sm text-gray-500 mb-2">${item.lifespan}</p>
                    <p class="font-semibold text-gray-800">${item.title}</p>
                    <p class="text-gray-600 mt-2 text-sm flex-grow">${item.summary}</p>
                </article>`;
        },

        createConceptCardHtml(concept, index) {
            return `
                <article class="concept-card bg-white p-6 rounded-lg shadow-md flex flex-col">
                    <h3 class="text-xl font-bold text-purple-700">${concept.name}</h3>
                    <p class="text-gray-600 mt-2 flex-grow text-sm">${concept.description}</p>
                    <button class="generate-analogy-btn mt-4 text-sm bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-md hover:bg-purple-200" data-index="${index}">✨ Explain with Analogy</button>
                    <div id="analogy-output-${index}" aria-live="polite" class="mt-2 text-sm"></div>
                </article>`;
        },
        
        createSimpleCardHtml(item, type, index) {
             const colors = { foundation: 'text-gray-800', casestudy: 'text-yellow-800', essay: 'text-blue-800' };
            return `
                <article role="button" tabindex="0" class="simple-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer flex flex-col" data-type="${type}" data-index="${index}">
                      <h3 class="text-xl font-bold ${colors[type]}">${item.title}</h3>
                      <p class="text-gray-600 mt-2 text-sm flex-grow">${item.summary}</p>
                </article>`;
        },

        renderComparisonLab() {
            const allFigures = [...this.navigators, ...this.thinkers].sort((a, b) => a.name.localeCompare(b.name));
            const figureOptions = `<option value="" disabled selected>Select a figure...</option>` + allFigures.map((person) => {
                const type = this.navigators.some(p => p.name === person.name) ? 'navigator' : 'thinker';
                const index = (type === 'navigator' ? this.navigators : this.thinkers).findIndex(p => p.name === person.name);
                return `<option value="${type}-${index}">${person.name}</option>`;
            }).join('');
            document.getElementById('figureA-select').innerHTML = figureOptions;
            document.getElementById('figureB-select').innerHTML = figureOptions;
            const uniqueCapabilities = [...new Set(allFigures.flatMap(f => f.capabilities || []))].sort();
            const capabilityOptions = `<option value="" disabled selected>Select a capability...</option>` + uniqueCapabilities.map(c => `<option value="${c}">${c}</option>`).join('');
            document.getElementById('capability-select').innerHTML = capabilityOptions;
        },

        // --- CORE AI INTERACTION ---
        async callGeminiAPI(prompt, outputElement) {
            if (!this.apiKey) {
                outputElement.innerHTML = `<p class="text-red-500 text-sm">Error: Set API Key in Settings.</p>`;
                return false;
            }
            if (!outputElement.id) outputElement.id = 'ai-response-' + Date.now();
            outputElement.setAttribute('tabindex', '-1');

            outputElement.innerHTML = '<div class="p-4 bg-gray-50 rounded italic text-gray-500 animate-pulse">Consulting the AI Tutor...</div>';
            
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
                });
                
                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (text) {
                    const formattedText = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    
                    const audioBtn = `
                        <button onclick="app.handleReadAloud('${outputElement.id}')" class="mb-2 flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline">
                            🔊 Listen to Response
                        </button>`;

                    outputElement.innerHTML = audioBtn + `<div>${formattedText}</div>`;
                    outputElement.focus(); // Accessibility: Move focus to the new content
                }
                return true;
            } catch (error) {
                outputElement.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
                return false;
            }
        },

        // --- FOCUS MANAGEMENT & MODALS ---
        handleCardClick(e) {
            const card = e.target.closest('article[data-index]');
            if (card) {
                const type = card.dataset.type;
                const index = card.dataset.index;
                let data;
                switch (type) {
                    case 'navigator': data = this.navigators[index]; break;
                    case 'thinker': data = this.thinkers[index]; break;
                    case 'foundation': data = this.foundations[index]; break;
                    case 'casestudy': data = this.caseStudies[index]; break;
                    case 'essay': data = this.essays[index]; break;
                    default: return;
                }
                this.showDetailModal(data, type);
            }
        },

        showDetailModal(data, type) {
            const modalContentEl = document.getElementById('modal-content-details');
            const modal = document.getElementById('detail-modal');
            this.previousFocus = document.activeElement;
            
            let html = '';
            this.currentModalFigure = null;

            if (type === 'navigator' || type === 'thinker') {
                html = this.getPersonModalHtml(data, type);
                this.currentModalFigure = data;
            } else {
                html = this.getSimpleModalHtml(data);
            }
            
            modalContentEl.innerHTML = html;
            const title = modalContentEl.querySelector('h2');
            if (title) {
                title.setAttribute('id', 'modal-title');
                title.setAttribute('tabindex', '-1');
            }

            modal.classList.remove('hidden');
            if (title) title.focus();

            const closeBtn = document.getElementById('close-modal');
            const handleClose = () => {
                modal.classList.add('hidden');
                if (this.previousFocus) this.previousFocus.focus();
                closeBtn.removeEventListener('click', handleClose);
                window.speechSynthesis.cancel();
            };
            closeBtn.addEventListener('click', handleClose);
        },

        // --- UI LOGIC & EVENT LISTENERS ---
        setupEventListeners() {
            // Screen Transitions
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    document.getElementById('welcome-screen').classList.add('hidden');
                    document.getElementById('app-container').classList.remove('hidden');
                });
            }

            // Tabs
            const tabButtons = document.querySelectorAll('.tab-btn');
            tabButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetId = btn.id.replace('-tab', '-section');
                    document.querySelectorAll('[role="tabpanel"]').forEach(p => p.classList.add('hidden'));
                    document.getElementById(targetId).classList.remove('hidden');
                    
                    tabButtons.forEach(b => {
                        b.setAttribute('aria-selected', 'false');
                        b.classList.remove('bg-indigo-100', 'border-indigo-600');
                    });
                    btn.setAttribute('aria-selected', 'true');
                    btn.classList.add('bg-indigo-100', 'border-indigo-600');
                });
            });

            // Settings
            document.getElementById('settings-btn').addEventListener('click', () => document.getElementById('settings-api-key-modal').classList.remove('hidden'));
            document.getElementById('cancel-api-key-btn').addEventListener('click', () => document.getElementById('settings-api-key-modal').classList.add('hidden'));
            document.getElementById('save-api-key-btn').addEventListener('click', () => {
                this.apiKey = document.getElementById('api-key-input-settings').value.trim();
                localStorage.setItem('ethical_cartography_key', this.apiKey);
                document.getElementById('settings-api-key-modal').classList.add('hidden');
                alert("Settings Saved.");
            });

            // Functional Interactions
            document.getElementById('concept-grid').addEventListener('click', e => this.handleConceptAnalogy(e));
            document.getElementById('find-counterparts-btn').addEventListener('click', () => this.handleResonanceLab());
            document.getElementById('compare-figures-btn').addEventListener('click', () => this.handleComparison());
            document.getElementById('resonance-send-btn').addEventListener('click', () => this.handleResonanceChat());
            document.getElementById('comparison-send-btn').addEventListener('click', () => this.handleComparisonChat());
            document.querySelectorAll('.card-container').forEach(c => {
                c.addEventListener('click', e => this.handleCardClick(e));
                c.addEventListener('keydown', e => { if(e.key === 'Enter') this.handleCardClick(e); });
            });
        },

        // --- SPECIFIC LAB PROMPTS (Integrated with 'Entropic World' knowledge) ---
        async handleResonanceLab() {
            const userInput = document.getElementById('resonance-input').value;
            if (!userInput.trim()) return;
            const outputElement = document.getElementById('counterparts-output');
            
            const figuresData = [...this.navigators, ...this.thinkers].map(f => ({ name: f.name, caps: f.capabilities }));
            this.currentResonance = { reflection: userInput };

            const prompt = `
                ${this.frameworkContext}
                STUDENT PRF REFLECTION: "${userInput}"
                TASK: Find 3 role models from this data: ${JSON.stringify(figuresData)}.
                Explain how their 'Ethical Capabilities' are functionally equivalent to the student's goals. 
                Focus on how they managed 'Moral Debt' or 'Temporal Coherence'.
            `;
            const success = await this.callGeminiAPI(prompt, outputElement);
            if (success) document.getElementById('resonance-chat-container').classList.remove('hidden');
        },

        handleModalChat(inputElement) {
            const userInput = inputElement.value;
            if (!userInput.trim() || !this.currentModalFigure) return;
            const outputContainer = document.getElementById('modal-chat-output');
            const data = this.currentModalFigure;

            const prompt = `
                SIMULATION: You are ${data.name}. 
                PRF DATA: ${data.broa} | ATCF: ${data.atcf}.
                Instruction: Speak as yourself, but use 'Constructor Ethics' and 'Multi-Scale Coherence' to explain your historical choices.
                Disclaimer: (Historical Simulation via PRF Analysis)
                Question: "${userInput}"
            `;
            this.appendChatTurn(outputContainer, userInput, prompt);
            inputElement.value = '';
        },

        appendChatTurn(container, userInput, prompt) {
            const turnId = 'turn-' + Date.now();
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <div class="p-3 bg-indigo-50 rounded mb-2 text-sm"><strong>Student:</strong> ${userInput}</div>
                <div id="${turnId}" class="p-3 bg-white border rounded mb-4 text-sm"></div>`;
            container.appendChild(wrapper);
            this.callGeminiAPI(prompt, document.getElementById(turnId));
        },

        getPersonModalHtml(data, type) {
            return `
                <h2 class="text-3xl font-bold mb-1">${data.name}</h2>
                <p class="text-gray-500 mb-4">${data.title} (${data.lifespan})</p>
                <button onclick="app.handleReadAloud('kernel-details')" class="mb-4 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm">
                    🔊 Listen to Identity Kernel Analysis
                </button>
                <div id="kernel-details" class="space-y-6 text-gray-700 text-sm">
                    <div class="bg-gray-50 p-4 rounded border-l-4 border-indigo-400"><strong>Assembly History:</strong> ${data.assemblyHistory}</div>
                    <div><h4 class="font-bold uppercase text-xs text-gray-500">BROA+ Configuration (Phenomenal Frame)</h4>${data.broa}</div>
                    <div><h4 class="font-bold uppercase text-xs text-gray-500">Adaptive Temporal Coherence (ATCF)</h4><p>${data.atcf}</p></div>
                    <div><h4 class="font-bold uppercase text-xs text-gray-500">Core Capabilities</h4><ul class="list-disc pl-5">${(data.capabilities || []).map(c => `<li>${c}</li>`).join('')}</ul></div>
                </div>
                <div class="border-t pt-4 mt-6">
                    <h4 class="font-bold text-indigo-900 mb-2">Engage with ${data.name} ✨</h4>
                    <div id="modal-chat-output" aria-live="polite"></div>
                    <div class="flex mt-2">
                        <input type="text" id="modal-chat-input" class="flex-1 border rounded-l p-2" placeholder="Ask a question...">
                        <button id="modal-chat-send" class="bg-indigo-600 text-white px-4 rounded-r">Send</button>
                    </div>
                </div>`;
        },

        getSimpleModalHtml(data) {
            return `
                <h2 class="text-3xl font-bold mb-2">${data.title}</h2>
                <p class="text-gray-600 mb-4">${data.summary}</p>
                <div class="prose text-sm text-gray-700">${data.content || data.analysis || ""}</div>`;
        }
    };

    app.init();
});

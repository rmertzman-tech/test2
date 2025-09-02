document.addEventListener('DOMContentLoaded', () => {

    const app = {
        apiKey: '',

        // Load data from the global appData object
        navigators: appData.navigators,
        thinkers: appData.thinkers,
        concepts: appData.concepts,
        foundations: appData.foundations,
        caseStudies: appData.caseStudies,
        essays: appData.essays,

        // A concise summary of your framework to give the AI context for every query.
        frameworkContext: `
            You are an expert in Robert Mertzman's philosophical system, "Capability-Based Coordination." Your entire knowledge base for this conversation is the following set of principles:

            1.  [cite_start]**Personal Reality Framework (PRF):** Each person has a unique architecture for organizing experience, made of their Beliefs, Rules, Ontological commitments, and Authenticity criteria (BROA+). It's a dynamic system, shaped by their life story (Assembly History), that guides action[cite: 1460, 2467].
            2.  **Capability-Based Coordination & Functional Equivalence:** The core idea that ethical coordination doesn't require people to share identical beliefs. Instead, they can coordinate by developing "functionally equivalent" capabilities that achieve the same shared goal. [cite_start]Different methods can be used to advance the same shared network objective[cite: 5, 17, 36, 41, 1603].
            3.  **Adaptive Temporal Coherence Function (ATCF):** A measure of an agent's ability to maintain a coherent identity over time by integrating past experiences, present actions, and future aspirations. [cite_start]High ATCF is a mark of ethical maturity[cite: 2492, 2493].
            4.  **Bootstrap Authority:** Normative authority isn't granted by external credentials but emerges from demonstrated competence in advancing shared goals. [cite_start]Any agent capable of asking normative questions already demonstrates commitment to the temporal coherence required for coordination[cite: 5, 23, 2413, 2445].
            5.  [cite_start]**Two Operating Systems:** People can simultaneously run two systems: OS1 (Truth-Commitment for deep personal meaning) and OS2 (Capability-Coordination for practical cooperation with those who hold different truths)[cite: 1486, 1488, 1801].
        `,

        init() {
            this.loadApiKey();
            this.renderAllContent();
            this.setupEventListeners();
        },

        loadApiKey() {
            const savedKey = localStorage.getItem('geminiApiKey');
            if (savedKey) {
                this.apiKey = savedKey;
            }
        },
        
        // Renders all the cards on initial page load
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
        
        // HTML templates for the different types of cards on the main page
        createCardHtml(item, type, index) {
            const colors = { navigator: 'text-indigo-700', thinker: 'text-teal-700' };
            return `
                <div class="profile-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col" data-type="${type}" data-index="${index}">
                    <h3 class="text-xl font-bold ${colors[type]}">${item.name}</h3>
                    <p class="text-sm text-gray-500 mb-2">${item.lifespan}</p>
                    <p class="font-semibold text-gray-800">${item.title}</p>
                    <p class="text-gray-600 mt-2 text-sm flex-grow">${item.summary}</p>
                </div>`;
        },

        createConceptCardHtml(concept, index) {
            return `
                <div class="concept-card bg-white p-6 rounded-lg shadow-md flex flex-col">
                    <h3 class="text-xl font-bold text-purple-700">${concept.name}</h3>
                    <p class="text-gray-600 mt-2 flex-grow text-sm">${concept.description}</p>
                    <button class="generate-analogy-btn mt-4 text-sm bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-md hover:bg-purple-200" data-index="${index}">✨ Explain with an Analogy</button>
                    <div id="analogy-output-${index}" class="mt-2 text-sm"></div>
                </div>`;
        },
        
        createSimpleCardHtml(item, type, index) {
             const colors = { foundation: 'text-gray-800', casestudy: 'text-yellow-800', essay: 'text-blue-800' };
            return `
                <div class="simple-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col" data-type="${type}" data-index="${index}">
                     <h3 class="text-xl font-bold ${colors[type]}">${item.title}</h3>
                     <p class="text-gray-600 mt-2 text-sm flex-grow">${item.summary}</p>
                </div>
            `;
        },

        renderComparisonLab() {
            const allFigures = [...this.navigators, ...this.thinkers].sort((a, b) => a.name.localeCompare(b.name));
            const figureOptions = `<option value="" disabled selected>Select a figure...</option>` + allFigures.map((person, i) => {
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

        async callGeminiAPI(prompt, outputElement) {
            if (!this.apiKey) {
                document.getElementById('settings-api-key-modal').classList.remove('hidden');
                return;
            }
            outputElement.innerHTML = '<div class="loader"></div>';
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error.message);
                }
                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    outputElement.innerHTML = `<div class="gemini-output p-4 bg-gray-100 rounded-md">${text.replace(/\n/g, '<br>')}</div>`;
                } else {
                    throw new Error("Received an empty or invalid response from the API.");
                }
            } catch (error) {
                console.error("API Error:", error);
                outputElement.innerHTML = `<p class="text-red-500 text-sm">Error: ${error.message}</p>`;
            }
        },

        setupEventListeners() {
            const startBtn = document.getElementById('start-btn');
            const welcomeScreen = document.getElementById('welcome-screen');
            const appContainer = document.getElementById('app-container');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    welcomeScreen.classList.add('hidden');
                    appContainer.classList.remove('hidden');
                });
            }

            const tabs = {
                navigators: { btn: document.getElementById('navigators-tab'), section: document.getElementById('navigators-section') },
                thinkers:   { btn: document.getElementById('thinkers-tab'),   section: document.getElementById('thinkers-section') },
                concepts:   { btn: document.getElementById('concepts-tab'),   section: document.getElementById('concepts-section') },
                foundations:{ btn: document.getElementById('foundations-tab'),section: document.getElementById('foundations-section') },
                casestudies:{ btn: document.getElementById('casestudies-tab'),section: document.getElementById('casestudy-section') },
                essays:     { btn: document.getElementById('essays-tab'),     section: document.getElementById('essay-section') },
                comparison: { btn: document.getElementById('comparison-tab'), section: document.getElementById('comparison-section') },
                resonance:  { btn: document.getElementById('resonance-tab'),  section: document.getElementById('resonance-section') }
            };

            Object.values(tabs).forEach(tab => {
                if (tab.btn) {
                    tab.btn.addEventListener('click', () => {
                        Object.values(tabs).forEach(t => {
                            if(t.section) t.section.classList.add('hidden');
                            if(t.btn) t.btn.setAttribute('aria-selected', 'false');
                        });
                        tab.section.classList.remove('hidden');
                        tab.btn.setAttribute('aria-selected', 'true');
                    });
                }
            });
            if (tabs.navigators.btn) tabs.navigators.btn.setAttribute('aria-selected', 'true');

            // --- Modal Event Listeners ---
            const detailModal = document.getElementById('detail-modal');
            document.getElementById('close-modal').addEventListener('click', () => detailModal.classList.add('hidden'));
            detailModal.addEventListener('click', e => (e.target === detailModal) && detailModal.classList.add('hidden'));
            document.querySelectorAll('.card-container').forEach(c => c.addEventListener('click', e => this.handleCardClick(e)));

            // --- Settings API Key Listeners ---
            const settingsModal = document.getElementById('settings-api-key-modal');
            document.getElementById('settings-btn').addEventListener('click', () => settingsModal.classList.remove('hidden'));
            document.getElementById('cancel-api-key-btn').addEventListener('click', () => settingsModal.classList.add('hidden'));
            document.getElementById('save-api-key-btn').addEventListener('click', () => {
                const newKey = document.getElementById('api-key-input-settings').value.trim();
                this.apiKey = newKey;
                if (newKey) localStorage.setItem('geminiApiKey', newKey);
                else localStorage.removeItem('geminiApiKey');
                settingsModal.classList.add('hidden');
            });

            // --- AI Feature Listeners ---
            document.getElementById('concept-grid').addEventListener('click', e => this.handleConceptAnalogy(e));
            document.getElementById('find-counterparts-btn').addEventListener('click', () => this.handleResonanceLab());
            document.getElementById('compare-figures-btn').addEventListener('click', () => this.handleComparison());
            document.getElementById('capability-select').addEventListener('change', e => this.handleCapabilityExplorer(e));
        },

        handleConceptAnalogy(e) {
            if (e.target.classList.contains('generate-analogy-btn')) {
                const index = e.target.dataset.index;
                const concept = this.concepts[index];
                const outputElement = document.getElementById(`analogy-output-${index}`);
                const prompt = `${this.frameworkContext}
                
                A student needs a simple, relatable analogy to understand the following concept:
                **Concept:** "${concept.name}"
                **Description:** "${concept.description}"
                
                Your task: Create an analogy in an accessible, educational tone. The framework often uses examples from technology (like software or HTML) or collaborative activities (like gaming or sports) to explain coordination. Please create an analogy in that spirit.`;
                this.callGeminiAPI(prompt, outputElement);
            }
        },

        handleResonanceLab() {
            const userInput = document.getElementById('resonance-input').value;
            if (!userInput.trim()) return;
            const outputElement = document.getElementById('counterparts-output');
            const allFigures = [...this.navigators, ...this.thinkers];
            const figuresData = allFigures.map(f => ({ name: f.name, summary: f.summary, capabilities: (f.capabilities || []).join(', ') }));

            const prompt = `${this.frameworkContext}
            
            A student is exploring their own ethical framework. They've provided this personal reflection: "${userInput}".
            
            From the following list of historical figures, identify the top 3-5 figures who demonstrate a "functionally equivalent" capability or concern.
            
            List: ${JSON.stringify(figuresData, null, 2)}
            
            For each match, provide a brief (2-3 sentence) explanation of the connection, using the framework's terminology (like PRF, capabilities, temporal coherence) to help the student see them as a potential role model. Format the entire response in clean HTML using paragraphs and lists.`;
            this.callGeminiAPI(prompt, outputElement);
        },

        handleComparison() {
            const valA = document.getElementById('figureA-select').value;
            const valB = document.getElementById('figureB-select').value;
            if (!valA || !valB || valA === valB) return;

            const [typeA, indexA] = valA.split('-');
            const personA = (typeA === 'navigator' ? this.navigators : this.thinkers)[indexA];
            const [typeB, indexB] = valB.split('-');
            const personB = (typeB === 'navigator' ? this.navigators : this.thinkers)[indexB];

            const outputElement = document.getElementById('comparison-output');
            const prompt = `${this.frameworkContext}
            
            Analyze the "Functional Equivalence" between ${personA.name} and ${personB.name}.
            
            **Profile for ${personA.name}:**
            ${personA.fullPrfAnalysis || personA.broa}

            **Profile for ${personB.name}:**
            ${personB.fullPrfAnalysis || personB.broa}

            **Your Task:**
            1. Identify one or two key ethical capabilities they share, even if they developed them from different backgrounds (Assembly History) or belief systems (BROA+).
            2. Explain how their unique PRFs led them to this shared capability.
            3. Conclude by explaining how this demonstrates 'Functional Equivalence' in action. Frame the analysis for a college student, formatting it in clean HTML.`;
            this.callGeminiAPI(prompt, outputElement);
        },

        handleCapabilityExplorer(e) {
            const selectedCapability = e.target.value;
            const outputElement = document.getElementById('capability-explorer-output');
            if (selectedCapability) {
                const allFigures = [...this.navigators, ...this.thinkers];
                const matchingFigures = allFigures.filter(f => (f.capabilities || []).includes(selectedCapability));
                outputElement.innerHTML = matchingFigures.map(person => {
                    const type = this.navigators.some(p => p.name === person.name) ? 'navigator' : 'thinker';
                    const index = (type === 'navigator' ? this.navigators : this.thinkers).findIndex(p => p.name === person.name);
                    return this.createCardHtml(person, type, index);
                }).join('');
            } else {
                outputElement.innerHTML = '';
            }
        },

        handleCardClick(e) {
            const card = e.target.closest('div[data-index]');
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
            let html = '';

            switch (type) {
                case 'navigator': html = this.getNavigatorModalHtml(data); break;
                case 'thinker': html = this.getThinkerModalHtml(data); break;
                case 'foundation':
                case 'casestudy':
                case 'essay':
                    html = this.getSimpleModalHtml(data); break;
            }
            
            modalContentEl.innerHTML = html;
            modal.classList.remove('hidden');
            modal.querySelector('.modal-content').scrollTop = 0;

            // Add listener for the new chat feature if it's a person
            if ((type === 'navigator' || type === 'thinker') && document.getElementById('modal-chat-send')) {
                document.getElementById('modal-chat-send').addEventListener('click', () => {
                    const userInput = document.getElementById('modal-chat-input').value;
                    if (!userInput.trim()) return;
                    const outputElement = document.getElementById('modal-chat-output');
                    const prompt = `${this.frameworkContext}

                    A student is viewing the profile of ${data.name}. Here is the full analysis for context:
                    ---
                    ${data.fullPrfAnalysis || data.broa}
                    ---
                    The student has the following question: "${userInput}"

                    Your task: Answer the student's question as if you are ${data.name}, but explain your reasoning using the concepts from the framework (PRF, ATCF, capabilities, etc.). Keep the tone accessible and educational. Format as clean HTML.`;
                    this.callGeminiAPI(prompt, outputElement);
                });
            }
        },
        
        getPersonModalHtml(data, type) {
            const color = type === 'navigator' ? 'text-indigo-800' : 'text-teal-800';
            return `
                <h2 class="text-3xl font-bold mb-1 ${color}">${data.name}</h2>
                <p class="text-md text-gray-500 mb-4">${data.title} (${data.lifespan})</p>
                <div class="flex space-x-4 mb-4">
                    <a href="${data.bioLink}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline text-sm">Read Full Biography ↗</a>
                </div>
                <div class="space-y-6 text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none">
                    <div><h4>Assembly History</h4>${data.assemblyHistory || ''}</div>
                    <div><h4>BROA+ Configuration</h4>${data.broa || ''}</div>
                    <div><h4>Adaptive Temporal Coherence Function (ATCF)</h4><p>${data.atcf || ''}</p></div>
                    <div><h4>Future-Oriented Projections (FOP)</h4><p>${data.fop || ''}</p></div>
                    <div><h4>Key Ethical Capabilities</h4><ul>${(data.capabilities || []).map(c => `<li>${c}</li>`).join('')}</ul></div>
                    ${data.foundationalLinks ? `<div><h4>Foundational Links</h4><ul>${(data.foundationalLinks || []).map(link => `<li>${link}</li>`).join('')}</ul></div>` : ''}
                    ${data.fullPrfAnalysis ? `<div class="pt-4 mt-4 border-t"><h4>Full PRF Analysis</h4>${data.fullPrfAnalysis.replace(/\n\n/g, '<p>').replace(/\n/g, '<br>')}</div>` : ''}
                </div>
                <div class="border-t pt-4 mt-6">
                    <h4 class="font-semibold text-lg text-gray-900 mb-2">Chat with an expert on ${data.name} ✨</h4>
                    <div id="modal-chat-output"></div>
                    <div class="mt-2 flex rounded-md shadow-sm">
                        <input type="text" id="modal-chat-input" class="flex-1 block w-full rounded-none rounded-l-md border-gray-300" placeholder="Ask a question...">
                        <button id="modal-chat-send" class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-sm hover:bg-gray-100">Send</button>
                    </div>
                </div>
            `;
        },

        getNavigatorModalHtml(data) {
            return this.getPersonModalHtml(data, 'navigator');
        },

        getThinkerModalHtml(data) {
            return this.getPersonModalHtml(data, 'thinker');
        },
        
        getSimpleModalHtml(data) {
            const fullContent = data.content || data.analysis || data.summary || '';
            return `
                 <h2 class="text-3xl font-bold mb-4">${data.title}</h2>
                 <div class="prose prose-sm max-w-none text-gray-700">${fullContent.replace(/\n/g, '<br>')}</div>
            `;
        }
    };

    app.init();
});

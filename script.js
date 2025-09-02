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
        disclaimerText: appData.disclaimerText,


        init() {
            this.loadApiKey();
            this.renderAll();
            this.setupEventListeners();
        },

        loadApiKey() {
            const savedKey = localStorage.getItem('geminiApiKey');
            if (savedKey) {
                this.apiKey = savedKey;
            }
        },

        renderAll() {
            // Render initial content into the DOM
            document.getElementById('profile-grid').innerHTML = this.navigators.map((profile, index) => this.createCardHtml(profile, 'navigator', index)).join('');
            document.getElementById('thinker-grid').innerHTML = this.thinkers.map((thinker, index) => this.createCardHtml(thinker, 'thinker', index)).join('');
            document.getElementById('concept-grid').innerHTML = this.concepts.map((concept, index) => this.createConceptCardHtml(concept, index)).join('');
            document.getElementById('foundation-grid').innerHTML = this.foundations.map((item, index) => this.createSimpleCardHtml(item, 'foundation', index)).join('');
            document.getElementById('casestudy-grid').innerHTML = this.caseStudies.map((item, index) => this.createSimpleCardHtml(item, 'casestudy', index)).join('');
            document.getElementById('essay-grid').innerHTML = this.essays.map((item, index) => this.createSimpleCardHtml(item, 'essay', index)).join('');
            
            // Set disclaimer text
            const disclaimerEl = document.getElementById('disclaimer-text');
            if(disclaimerEl) disclaimerEl.textContent = this.disclaimerText;

            this.renderComparisonLab();
        },
        
        createCardHtml(item, type, index) {
            const colors = {
                navigator: 'text-indigo-700',
                thinker: 'text-teal-700',
            };
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
                    <button class="generate-analogy-btn mt-4 text-sm bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-md hover:bg-purple-200 transition-colors" data-index="${index}">✨ Explain with an Analogy</button>
                    <div id="analogy-output-${index}" class="mt-2 text-sm"></div>
                </div>`;
        },
        
        createSimpleCardHtml(item, type, index) {
             const colors = {
                foundation: 'text-gray-800',
                casestudy: 'text-yellow-800',
                essay: 'text-blue-800'
            };
            return `
                <div class="simple-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col" data-type="${type}" data-index="${index}">
                     <h3 class="text-xl font-bold ${colors[type]}">${item.title}</h3>
                     <p class="text-gray-600 mt-2 text-sm flex-grow">${item.summary}</p>
                </div>
            `;
        },

        renderComparisonLab() {
            const allFigures = [...this.navigators.map((p, i) => ({ ...p, type: 'navigator', index: i })), ...this.thinkers.map((p, i) => ({ ...p, type: 'thinker', index: i }))]
                .sort((a, b) => a.name.localeCompare(b.name));

            const figureOptions = `<option value="" disabled selected>Select a figure...</option>` + allFigures.map(person =>
                `<option value="${person.type}-${person.index}">${person.name}</option>`
            ).join('');

            document.getElementById('figureA-select').innerHTML = figureOptions;
            document.getElementById('figureB-select').innerHTML = figureOptions;

            const uniqueCapabilities = [...new Set(allFigures.flatMap(f => f.capabilities || []))].sort();
            const capabilityOptions = `<option value="" disabled selected>Select a capability...</option>` + uniqueCapabilities.map(c => `<option value="${c}">${c}</option>`).join('');
            document.getElementById('capability-select').innerHTML = capabilityOptions;
        },

        async callGeminiAPI(prompt, outputElement, chatContainer) {
            if (!this.apiKey) {
                document.getElementById('settings-api-key-modal').classList.remove('hidden');
                return;
            }

            outputElement.innerHTML = '<div class="loader"></div>';
            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0].text) {
                        const text = result.candidates[0].content.parts[0].text;
                        outputElement.innerHTML = `<div class="gemini-output p-4 bg-gray-100 rounded-md">${text.replace(/\n/g, '<br>')}</div>`;
                        if(chatContainer) chatContainer.classList.remove('hidden');
                    } else {
                        outputElement.innerHTML = '<p class="text-red-500 text-sm">Received an empty or invalid response from the API.</p>';
                    }
                } else {
                    const error = await response.json();
                    console.error("API Error:", error);
                    outputElement.innerHTML = `<p class="text-red-500 text-sm">API Error: ${error.error.message}</p>`;
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                outputElement.innerHTML = '<p class="text-red-500 text-sm">Could not connect to the API. Check your network connection and API key.</p>';
            }
        },

        setupEventListeners() {
            // --- FIX START: Correctly handle the welcome screen ---
            const startBtn = document.getElementById('start-btn');
            const welcomeScreen = document.getElementById('welcome-screen');
            const appContainer = document.getElementById('app-container');

            if (startBtn && welcomeScreen && appContainer) {
                startBtn.addEventListener('click', () => {
                    welcomeScreen.classList.add('hidden');
                    appContainer.classList.remove('hidden');
                });
            }
            // --- FIX END ---

            // Tab Navigation
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

            Object.keys(tabs).forEach(key => {
                if (tabs[key].btn) {
                    tabs[key].btn.addEventListener('click', () => {
                        Object.values(tabs).forEach(tab => {
                            if (tab.section) tab.section.classList.add('hidden');
                            if (tab.btn) tab.btn.setAttribute('aria-selected', 'false');
                        });
                        if (tabs[key].section) tabs[key].section.classList.remove('hidden');
                        if (tabs[key].btn) tabs[key].btn.setAttribute('aria-selected', 'true');
                    });
                }
            });
             // Set default tab
            if (tabs.navigators.btn) tabs.navigators.btn.setAttribute('aria-selected', 'true');


            // Modal Logic
            const detailModal = document.getElementById('detail-modal');
            const closeModalBtn = document.getElementById('close-modal');
            
            // Add click listeners to all card containers
            document.querySelectorAll('.card-container').forEach(container => {
                container.addEventListener('click', (e) => this.handleCardClick(e));
            });
            
            closeModalBtn.addEventListener('click', () => detailModal.classList.add('hidden'));
            detailModal.addEventListener('click', (e) => {
                if (e.target === detailModal) {
                    detailModal.classList.add('hidden');
                }
            });
            
            // Settings API Key Modal Logic
            const settingsApiKeyModal = document.getElementById('settings-api-key-modal');
            document.getElementById('settings-btn').addEventListener('click', () => {
                document.getElementById('api-key-input-settings').value = this.apiKey;
                settingsApiKeyModal.classList.remove('hidden');
            });
            document.getElementById('cancel-api-key-btn').addEventListener('click', () => settingsApiKeyModal.classList.add('hidden'));
            document.getElementById('save-api-key-btn').addEventListener('click', () => {
                const newKey = document.getElementById('api-key-input-settings').value.trim();
                this.apiKey = newKey;
                if (newKey) {
                    localStorage.setItem('geminiApiKey', newKey);
                } else {
                     localStorage.removeItem('geminiApiKey');
                }
                settingsApiKeyModal.classList.add('hidden');
            });

            // Concept Analogy Generator
            document.getElementById('concept-grid').addEventListener('click', (e) => {
                if (e.target.classList.contains('generate-analogy-btn')) {
                    const index = e.target.dataset.index;
                    const concept = this.concepts[index];
                    const outputElement = document.getElementById(`analogy-output-${index}`);
                    const prompt = `Explain the following complex ethical concept in a simple, relatable analogy for a college student: "${concept.name} - ${concept.description}". Keep the tone insightful but easy to understand.`;
                    this.callGeminiAPI(prompt, outputElement);
                }
            });

            // Personal Resonance Lab
            document.getElementById('find-counterparts-btn').addEventListener('click', () => {
                const userInput = document.getElementById('resonance-input').value;
                if (!userInput.trim()) return;
                const outputElement = document.getElementById('counterparts-output');
                const chatContainer = document.getElementById('resonance-chat-container');
                const allFigures = [...this.navigators, ...this.thinkers];
                const figuresData = allFigures.map(f => ({ name: f.name, summary: f.summary, capabilities: (f.capabilities || []).join(', ') }) );

                const prompt = `A user is exploring their own ethical framework. They've provided this personal reflection: "${userInput}".
                
                From the following list of historical figures, identify the top 3-5 figures who demonstrate a "functionally equivalent" capability or concern.
                
                List: ${JSON.stringify(figuresData, null, 2)}
                
                For each match, provide a brief (2-3 sentence) explanation of the connection, helping the user see them as a potential role model. Format the entire response in clean HTML using paragraphs and lists.`;
                
                this.callGeminiAPI(prompt, outputElement, chatContainer);
            });

            // Comparison Lab
            document.getElementById('compare-figures-btn').addEventListener('click', () => {
                const valA = document.getElementById('figureA-select').value;
                const valB = document.getElementById('figureB-select').value;
                if (!valA || !valB || valA === valB) return;

                const [typeA, indexA] = valA.split('-');
                const personA = (typeA === 'navigator' ? this.navigators : this.thinkers)[indexA];
                
                const [typeB, indexB] = valB.split('-');
                const personB = (typeB === 'navigator' ? this.navigators : this.thinkers)[indexB];

                const outputElement = document.getElementById('comparison-output');
                const chatContainer = document.getElementById('comparison-chat-container');

                const prompt = `Analyze the functional equivalence between ${personA.name} and ${personB.name}.
                
                - **${personA.name}**: Key ideas: ${personA.broa}. Capabilities: ${(personA.capabilities || []).join(', ')}.
                - **${personB.name}**: Key ideas: ${personB.broa}. Capabilities: ${(personB.capabilities || []).join(', ')}.
                
                1. Identify a core ethical capability they share, even if they developed it differently.
                2. Briefly explain how each person's unique background led to that shared capability.
                3. Conclude with a summary of their functional equivalence. Format the response in clean HTML.`;
                
                this.callGeminiAPI(prompt, outputElement, chatContainer);
            });

            document.getElementById('capability-select').addEventListener('change', (e) => {
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
            });
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
        },
        
        // --- FIX START: Corrected function to use data from data.js ---
        getNavigatorModalHtml(data) {
            return `
                <h2 class="text-3xl font-bold mb-1 text-indigo-800">${data.name}</h2>
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
                    ${data.fullPrfAnalysis ? `<div class="pt-4 mt-4 border-t"><h4>Full PRF Analysis</h4>${data.fullPrfAnalysis.replace(/\n/g, '<br>')}</div>` : ''}
                </div>`;
        },
        // --- FIX END ---

        getThinkerModalHtml(data) {
             return `
                <h2 class="text-3xl font-bold mb-1 text-teal-800">${data.name}</h2>
                <p class="text-md text-gray-500 mb-4">${data.title} (${data.lifespan})</p>
                <div class="space-y-6 text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none">
                    <div><h4>Assembly History</h4><p>${data.assemblyHistory || ''}</p></div>
                    <div><h4>BROA+ Configuration</h4>${data.broa || ''}</div>
                    <div><h4>Adaptive Temporal Coherence Function (ATCF)</h4><p>${data.atcf || ''}</p></div>
                    <div><h4>Future-Oriented Projections (FOP)</h4><p>${data.fop || ''}</p></div>
                    <div><h4>Key Ethical Capabilities</h4><ul>${(data.capabilities || []).map(c => `<li>${c}</li>`).join('')}</ul></div>
                    ${data.foundationalLinks ? `<div><h4>Foundational Links</h4><ul>${(data.foundationalLinks || []).map(link => `<li>${link}</li>`).join('')}</ul></div>` : ''}
                </div>`;
        },
        
        getSimpleModalHtml(data) {
            return `
                 <h2 class="text-3xl font-bold mb-4">${data.title}</h2>
                 <div class="prose prose-sm max-w-none text-gray-700">
                    ${data.content || data.analysis || data.summary}
                 </div>
            `;
        }
    };

    app.init();
});

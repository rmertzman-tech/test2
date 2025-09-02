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
        disclaimer: appData.disclaimerText,
        
        // To hold conversational context
        comparisonChatHistory: [],
        resonanceChatHistory: [],

        init() {
            this.loadApiKey();
            this.renderNavigators();
            this.renderThinkers();
            this.renderConcepts();
            this.renderFoundations();
            this.renderCaseStudies();
            this.renderEssays();
            this.renderComparisonLab();
            this.setupEventListeners();
            
            // Load saved user reflection
            const savedResonance = localStorage.getItem('resonanceInput');
            if (savedResonance) {
                document.getElementById('resonance-input').value = savedResonance;
            }
        },

        loadApiKey() {
            const savedKey = localStorage.getItem('geminiApiKey');
            if (savedKey) {
                this.apiKey = savedKey;
            }
        },
        
        renderNavigators() {
            const grid = document.getElementById('profile-grid');
            if (!grid) return;
            grid.innerHTML = this.navigators.map((profile, index) => `
                <div class="profile-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col" data-type="navigator" data-index="${index}">
                    <h3 class="text-xl font-bold text-indigo-700">${profile.name}</h3>
                    <p class="text-sm text-gray-500 mb-2">${profile.lifespan}</p>
                    <p class="font-semibold text-gray-800">${profile.title}</p>
                    <p class="text-gray-600 mt-2 text-sm flex-grow">${profile.summary}</p>
                </div>
            `).join('');
        },

        renderThinkers() {
            const grid = document.getElementById('thinker-grid');
            if (!grid) return;
            grid.innerHTML = this.thinkers.map((thinker, index) => `
                 <div class="thinker-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col" data-type="thinker" data-index="${index}">
                     <h3 class="text-xl font-bold text-teal-700">${thinker.name}</h3>
                     <p class="text-sm text-gray-500 mb-2">${thinker.lifespan}</p>
                     <p class="font-semibold text-gray-800">${thinker.title}</p>
                     <p class="text-gray-600 mt-2 text-sm flex-grow">${thinker.summary}</p>
                 </div>
            `).join('');
        },

        renderConcepts() {
            const container = document.getElementById('concept-grid');
            if (!container) return;
            container.innerHTML = this.concepts.map((concept, index) => `
                <div class="concept-card bg-white p-6 rounded-lg shadow-md flex flex-col">
                    <h3 class="text-xl font-bold text-purple-700">${concept.name}</h3>
                    <p class="text-gray-600 mt-2 flex-grow text-sm">${concept.description}</p>
                    <div class="mt-4 flex flex-col space-y-2">
                        <button class="generate-analogy-btn text-sm bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-md hover:bg-purple-200 transition-colors" data-index="${index}">✨ Explain with an Analogy</button>
                        ${concept.deeperDiveLink !== undefined ? `<button class="deeper-dive-btn text-sm bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors" data-essay-index="${concept.deeperDiveLink}">Read a Deeper Dive</button>` : ''}
                    </div>
                    <div id="analogy-output-${index}" class="mt-2"></div>
                </div>
            `).join('');
        },

        renderFoundations() {
            const container = document.getElementById('foundation-grid');
            if (!container) return;
            // Add disclaimer
            document.getElementById('disclaimer-text').textContent = this.disclaimer;

            container.innerHTML = this.foundations.map((foundation, index) => `
                <div class="bg-white p-6 rounded-lg shadow-md flex flex-col">
                    <h3 class="text-xl font-bold text-gray-800">${foundation.title}</h3>
                    <p class="text-gray-600 mt-2 flex-grow text-sm">${foundation.summary}</p>
                    <div class="mt-4">
                        <h4 class="font-semibold text-sm text-gray-700">Key Concepts:</h4>
                        <ul class="list-disc list-inside mt-1 space-y-1 text-sm text-gray-600">
                            ${foundation.keyConcepts.map(c => `<li>${c}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `).join('');
        },

        renderCaseStudies() {
            const container = document.getElementById('casestudy-grid');
            if (!container) return;
            container.innerHTML = this.caseStudies.map((study, index) => `
                <div class="bg-white p-6 rounded-lg shadow-md flex flex-col cursor-pointer" data-type="casestudy" data-index="${index}">
                    <h3 class="text-xl font-bold text-blue-700">${study.title}</h3>
                    <p class="text-gray-600 mt-2 flex-grow text-sm">${study.summary}</p>
                </div>
            `).join('');
        },

        renderEssays() {
            const container = document.getElementById('essay-grid');
            if (!container) return;
            container.innerHTML = this.essays.map((essay, index) => `
                <div class="bg-white p-6 rounded-lg shadow-md flex flex-col cursor-pointer" data-type="essay" data-index="${index}">
                    <h3 class="text-xl font-bold text-green-700">${essay.title}</h3>
                    <p class="text-gray-600 mt-2 flex-grow text-sm">${essay.summary}</p>
                </div>
            `).join('');
        },


        renderComparisonLab() {
            const allFigures = [...this.navigators.map((p, i) => ({...p, type: 'navigator', index: i})), ...this.thinkers.map((p, i) => ({...p, type: 'thinker', index: i}))]
                .sort((a, b) => a.name.localeCompare(b.name));
            
            const figureOptions = `<option value="" disabled selected>Select a figure...</option>` + allFigures.map(person => 
                `<option value="${person.type}-${person.index}">${person.name} (${person.title})</option>`
            ).join('');

            const figureASelect = document.getElementById('figureA-select');
            const figureBSelect = document.getElementById('figureB-select');
            if (figureASelect) figureASelect.innerHTML = figureOptions;
            if (figureBSelect) figureBSelect.innerHTML = figureOptions;
            
            
            const uniqueCapabilities = [...new Set(allFigures.flatMap(f => f.capabilities || []))].sort();
            const capabilityOptions = `<option value="" disabled selected>Select a capability...</option>` + uniqueCapabilities.map(c => `<option value="${c}">${c}</option>`).join('');
            const capabilitySelect = document.getElementById('capability-select');
            if(capabilitySelect) capabilitySelect.innerHTML = capabilityOptions;
        },

        getFoundationSummary() {
            // This creates a concise summary of the core theory to prime the AI.
            let summary = "Core Theoretical Principles for Analysis:\n";
            summary += this.foundations.map(f => `- ${f.title}: ${f.summary}`).join('\n');
            summary += "\n\nKey Concepts to Apply:\n- The Recursive Foundation: We use our own frameworks to understand ourselves.\n- The Integrative Storyline: Cultural evolution created diverse, complementary psychological capabilities that can be coordinated.\n- Two Operating Systems for Truth: We need both deep 'Truth-Commitment' for meaning and practical 'Capability-Coordination' for cooperation across differences.\n- The Architecture of Ethical Reasoning: Ethics is an organizational challenge solved through Cross-Scale Information Organization, Capability-Based Propositions, and Temporal Coherence.\n";
            return summary;
        },

        async callGeminiAPI(initialPrompt, chatHistory, outputElement, inputContainer, isNewConversation = false) {
            if (!this.apiKey) {
                document.getElementById('settings-api-key-modal').classList.remove('hidden');
                return;
            }

            if (isNewConversation) {
                chatHistory.length = 0; // Clear history for a new conversation
                outputElement.innerHTML = ''; // Clear previous outputs
                const foundationSummary = this.getFoundationSummary();
                chatHistory.push({ role: "model", parts: [{ text: `Understood. I will use these principles: ${foundationSummary}` }] });
                chatHistory.push({ role: "user", parts: [{ text: initialPrompt }] });
            }

            outputElement.innerHTML += '<div class="loader"></div>';

            // We only send a subset of history to keep payload reasonable, but we retain full history locally.
            // Let's send the system message (implicit) and the last 10 messages.
            const apiPayloadContents = chatHistory.slice(-10);

            const payload = { contents: apiPayloadContents };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`;
            
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                // Remove the last loader before adding new content
                const loaders = outputElement.getElementsByClassName('loader');
                if (loaders.length > 0) {
                    loaders[loaders.length - 1].remove();
                }

                if (response.ok) {
                    const result = await response.json();
                    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0].text) {
                        const text = result.candidates[0].content.parts[0].text;
                        chatHistory.push({ role: "model", parts: [{ text: text }] });
                        
                        const outputHtml = isNewConversation ? '' : outputElement.innerHTML;
                        const formattedText = text.trim().replace(/\n/g, '<br>');
                        
                        if (isNewConversation) {
                            outputElement.innerHTML = `<div class="gemini-output">${formattedText}</div>`;
                        } else {
                             outputElement.innerHTML += `<div class="gemini-output mt-4">${formattedText}</div>`;
                        }

                        if(inputContainer) inputContainer.classList.remove('hidden'); // Show the chat input
                    } else {
                         outputElement.innerHTML += '<p class="text-red-500 text-sm mt-2">Received an empty response from the API.</p>';
                    }
                } else {
                     const error = await response.json();
                     console.error("API Error:", error);
                     outputElement.innerHTML += `<p class="text-red-500 text-sm mt-2">Error: ${error.error.message}</p>`;
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                const loaders = outputElement.getElementsByClassName('loader');
                if (loaders.length > 0) {
                    loaders[loaders.length - 1].remove();
                }
                outputElement.innerHTML += '<p class="text-red-500 text-sm mt-2">Could not connect to the API. Please check your network connection.</p>';
            }
        },

        setupEventListeners() {
            const startBtn = document.getElementById('start-btn');
            const welcomeScreen = document.getElementById('welcome-screen');
            const mainContent = document.getElementById('main-content');
            
            startBtn.addEventListener('click', () => {
                welcomeScreen.classList.add('hidden');
                mainContent.classList.remove('hidden');
            });


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

            const allSections = document.querySelectorAll('#main-content main > div');
            const allTabs = document.querySelectorAll('#main-content nav button');

            Object.values(tabs).forEach(tabInfo => {
                if (tabInfo.btn) {
                    tabInfo.btn.addEventListener('click', () => {
                        allSections.forEach(sec => sec.classList.add('hidden'));
                        allTabs.forEach(t => t.setAttribute('aria-selected', 'false'));
                        
                        if (tabInfo.section) {
                            tabInfo.section.classList.remove('hidden');
                            tabInfo.btn.setAttribute('aria-selected', 'true');
                        }
                    });
                }
            });


            // Modal Logic
            const detailModal = document.getElementById('detail-modal');
            const closeModalBtn = document.getElementById('close-modal');
            
            document.getElementById('profile-grid')?.addEventListener('click', (e) => this.handleCardClick(e));
            document.getElementById('thinker-grid')?.addEventListener('click', (e) => this.handleCardClick(e));
            document.getElementById('casestudy-grid')?.addEventListener('click', (e) => this.handleCardClick(e));
            document.getElementById('essay-grid')?.addEventListener('click', (e) => this.handleCardClick(e));

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
                localStorage.setItem('geminiApiKey', newKey);
                settingsApiKeyModal.classList.add('hidden');
            });

            // Concept Analogy and Deeper Dive
            document.getElementById('concept-grid')?.addEventListener('click', (e) => {
                const target = e.target;
                if (target.classList.contains('generate-analogy-btn')) {
                    const index = target.dataset.index;
                    const concept = this.concepts[index];
                    const outputElement = document.getElementById(`analogy-output-${index}`);
                    const prompt = `Explain the following complex ethical concept in a simple, relatable analogy for a college student: "${concept.name} - ${concept.description}".`;
                    this.callGeminiAPI(prompt, [], outputElement, null, true); // Standalone, not conversational
                }
                if (target.classList.contains('deeper-dive-btn')) {
                    const essayIndex = target.dataset.essayIndex;
                    // Switch to essays tab and highlight the essay
                    tabs.essays.btn.click();
                    const essayCard = document.querySelector(`#essay-grid div[data-index="${essayIndex}"]`);
                    if(essayCard) {
                        essayCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        essayCard.classList.add('ring-2', 'ring-offset-2', 'ring-green-500');
                        setTimeout(() => essayCard.classList.remove('ring-2', 'ring-offset-2', 'ring-green-500'), 2500);
                    }
                }
            });


            // Personal Resonance Lab
            const resonanceInput = document.getElementById('resonance-input');
            if(resonanceInput) {
                resonanceInput.addEventListener('input', () => {
                    localStorage.setItem('resonanceInput', resonanceInput.value);
                });
            }

            document.getElementById('find-counterparts-btn')?.addEventListener('click', () => {
                const userInput = resonanceInput.value;
                if (!userInput.trim()) {
                    alert("Please describe a value or capability first.");
                    return;
                }
                const outputElement = document.getElementById('counterparts-output');
                const inputContainer = document.getElementById('resonance-chat-container');
                const allFigures = [...this.navigators, ...this.thinkers];
                const figuresData = allFigures.map(f => ({ name: f.name, capabilities: (f.capabilities || []).join(', ') }) );

                const prompt = `A student has described an ethical value or capability they care about: "${userInput}".
                
                Analyze the student's input and compare it to the following list of historical figures and their key ethical capabilities:
                ${JSON.stringify(figuresData, null, 2)}

                Identify the top 3-5 figures who demonstrate a functionally equivalent capability. For each match, provide a brief, encouraging explanation of *how* that person's life and actions exemplify the capability the student described. Frame the response as a guide for the student's own ethical development.`;
                
                this.callGeminiAPI(prompt, this.resonanceChatHistory, outputElement, inputContainer, true);
            });

            // Resonance Lab Chat
            document.getElementById('resonance-send-btn')?.addEventListener('click', () => {
                const chatInput = document.getElementById('resonance-chat-input');
                const userMessage = chatInput.value.trim();
                if (userMessage) {
                    const outputElement = document.getElementById('counterparts-output');
                    outputElement.innerHTML += `<div class="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"><p class="font-semibold">You:</p><p>${userMessage}</p></div>`;
                    this.resonanceChatHistory.push({ role: "user", parts: [{ text: userMessage }] });
                    chatInput.value = '';
                    this.callGeminiAPI(null, this.resonanceChatHistory, outputElement, null, false);
                }
            });
            document.getElementById('resonance-chat-input')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('resonance-send-btn').click();
                }
            });

            // Comparison Lab
            document.getElementById('compare-figures-btn')?.addEventListener('click', () => {
                const valA = document.getElementById('figureA-select').value;
                const valB = document.getElementById('figureB-select').value;

                if (!valA || !valB || valA === valB) {
                    alert("Please select two different figures to compare.");
                    return;
                }

                const [typeA, indexA] = valA.split('-');
                const personA = typeA === 'navigator' ? this.navigators[indexA] : this.thinkers[indexA];

                const [typeB, indexB] = valB.split('-');
                const personB = typeB === 'navigator' ? this.navigators[indexB] : this.thinkers[indexB];

                const outputElement = document.getElementById('comparison-output');
                const inputContainer = document.getElementById('comparison-chat-container');
                const prompt = `Analyze the connection between ${personA.name} and ${personB.name} using the concept of 'Functional Equivalence'.

                **Your Task:**
                1. Identify one or two key ethical capabilities that both individuals demonstrate, drawing from their full PRF analyses.
                2. Explain how each person developed this shared capability from their unique background (Assembly History or PRF).
                3. Conclude by explaining how this demonstrates 'Functional Equivalence' in action. Frame the analysis for a college student, applying the core theoretical principles provided.
                
                **Full Analysis for ${personA.name}:** ${personA.fullPrfAnalysis || JSON.stringify(personA)}
                **Full Analysis for ${personB.name}:** ${personB.fullPrfAnalysis || JSON.stringify(personB)}`;

                this.callGeminiAPI(prompt, this.comparisonChatHistory, outputElement, inputContainer, true);
            });

            // Comparison Lab Chat
            document.getElementById('comparison-send-btn')?.addEventListener('click', () => {
                const chatInput = document.getElementById('comparison-chat-input');
                const userMessage = chatInput.value.trim();
                if (userMessage) {
                    const outputElement = document.getElementById('comparison-output');
                     outputElement.innerHTML += `<div class="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"><p class="font-semibold">You:</p><p>${userMessage}</p></div>`;
                    this.comparisonChatHistory.push({ role: "user", parts: [{ text: userMessage }] });
                    chatInput.value = '';
                    this.callGeminiAPI(null, this.comparisonChatHistory, outputElement, null, false);
                }
            });
             document.getElementById('comparison-chat-input')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('comparison-send-btn').click();
                }
            });


            document.getElementById('capability-select')?.addEventListener('change', (e) => {
                const selectedCapability = e.target.value;
                const outputElement = document.getElementById('capability-explorer-output');
                if (selectedCapability) {
                    const allFigures = [...this.navigators.map((p, i) => ({...p, type: 'navigator', index: i})), ...this.thinkers.map((p, i) => ({...p, type: 'thinker', index: i}))];
                    const matchingFigures = allFigures.filter(f => (f.capabilities || []).includes(selectedCapability));
                    
                    outputElement.innerHTML = matchingFigures.map(person => {
                        const cardType = person.type === 'navigator' ? 'profile-card' : 'thinker-card';
                        const color = person.type === 'navigator' ? 'text-indigo-700' : 'text-teal-700';
                        const originalIndex = person.type === 'navigator' ? this.navigators.findIndex(p => p.name === person.name) : this.thinkers.findIndex(p => p.name === person.name);
                        return `
                        <div class="${cardType} bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col" data-type="${person.type}" data-index="${originalIndex}">
                            <h3 class="text-xl font-bold ${color}">${person.name}</h3>
                            <p class="text-sm text-gray-500 mb-2">${person.lifespan}</p>
                            <p class="font-semibold text-gray-800">${person.title}</p>
                            <p class="text-gray-600 mt-2 text-sm flex-grow">${person.summary}</p>
                        </div>
                    `}).join('');
                    
                    outputElement.querySelectorAll('.profile-card, .thinker-card').forEach(card => {
                        card.addEventListener('click', (event) => this.handleCardClick(event));
                    });
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
                    case 'thinker':   data = this.thinkers[index]; break;
                    case 'casestudy': data = this.caseStudies[index]; break;
                    case 'essay':     data = this.essays[index]; break;
                    default: return;
                }
                this.showDetailModal(data, type);
            }
        },

        showDetailModal(data, type) {
            const modalContent = document.getElementById('modal-content-details');
            const modal = document.getElementById('detail-modal');
            
            let html = '';

            switch (type) {
                case 'navigator':
                case 'thinker':
                    html = this.getPersonModalHtml(data, type);
                    break;
                case 'casestudy':
                    html = this.getCaseStudyModalHtml(data);
                    break;
                case 'essay':
                    html = this.getEssayModalHtml(data);
                    break;
            }
            
            modalContent.innerHTML = html;
            modal.classList.remove('hidden');
            modal.querySelector('.modal-content').scrollTop = 0;

            // Add event listeners for new Gemini buttons
            if (type === 'navigator' || (data.assemblyHistory && type === 'thinker')) { // Updated condition
                document.getElementById('generate-dilemma-btn')?.addEventListener('click', () => {
                    const outputElement = document.getElementById('dilemma-output');
                    const inputContainer = document.getElementById('dilemma-chat-container');
                    const prompt = `Based on the life and ethical framework of ${data.name}, generate a short, new, hypothetical ethical dilemma they might have faced. The dilemma should test their core principles. Present the scenario and then ask, 'What should ${data.name} do?' Use their full PRF analysis for context: ${data.fullPrfAnalysis}`;
                    this.callGeminiAPI(prompt, [], outputElement, inputContainer, true);
                });

                document.getElementById('dilemma-send-btn')?.addEventListener('click', () => {
                    // This is a placeholder for a conversational dilemma, which would need its own chat history.
                    // For now, let's just re-generate a new dilemma as a simple action.
                    document.getElementById('generate-dilemma-btn').click();
                });
            }
        },
        
        getPersonModalHtml(data, type) {
            const color = type === 'navigator' ? 'text-indigo-800' : 'text-teal-800';
            const videoButton = data.videoUrl ? `<a href="${data.videoUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm">... Watch Video</a>` : '';
            
            const foundationalLinksHtml = (data.foundationalLinks || []).map(linkTitle => {
                const foundation = this.foundations.find(f => f.title === linkTitle);
                return foundation ? `<li><span class="font-semibold">${linkTitle}:</span> ${foundation.keyConcepts.join(', ')}</li>` : '';
            }).join('');
            
            return `
                <h2 class="text-3xl font-bold mb-1 ${color}">${data.name}</h2>
                <p class="text-md text-gray-500 mb-2">${data.title} (${data.lifespan})</p>
                <div class="flex space-x-4 mb-4">
                    ${data.bioLink ? `<a href="${data.bioLink}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline text-sm">Read Full Biography ↗</a>` : ''}
                    ${videoButton}
                </div>
                <div class="space-y-5 text-gray-700">
                    <div><h4 class="font-semibold text-lg text-gray-900 border-b pb-1 mb-2">Assembly History</h4><div class="text-sm">${data.assemblyHistory || 'N/A'}</div></div>
                    <div><h4 class="font-semibold text-lg text-gray-900 border-b pb-1 mb-2">BROA+ Configuration</h4><div class="text-sm">${data.broa || 'N/A'}</div></div>
                    <div><h4 class="font-semibold text-lg text-gray-900 border-b pb-1 mb-2">Adaptive Temporal Coherence (ATCF)</h4><p class="text-sm">${data.atcf || 'N/A'}</p></div>
                    <div><h4 class="font-semibold text-lg text-gray-900 border-b pb-1 mb-2">Future-Oriented Projections (FOP)</h4><p class="text-sm">${data.fop || 'N/A'}</p></div>
                    <div><h4 class="font-semibold text-lg text-gray-900 border-b pb-1 mb-2">Key Ethical Capabilities</h4><ul class="list-disc list-inside mt-2 space-y-1 text-sm">${(data.capabilities || []).map(c => `<li>${c}</li>`).join('')}</ul></div>
                    ${foundationalLinksHtml ? `<div><h4 class="font-semibold text-lg text-gray-900 border-b pb-1 mb-2">Theoretical Connections</h4><ul class="list-disc list-inside mt-2 space-y-1 text-sm">${foundationalLinksHtml}</ul></div>` : ''}
                    <div class="border-t pt-4 mt-4">
                        <h4 class="font-semibold text-lg text-gray-900 mb-2">Interactive Ethical Scenario ✨</h4>
                        <div class="mb-4">
                            <button id="generate-dilemma-btn" class="w-full text-sm bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700">Generate an Ethical Dilemma for ${data.name}</button>
                            <div id="dilemma-output" class="mt-2"></div>
                             <div id="dilemma-chat-container" class="hidden mt-4">
                                <!-- Future conversational feature can be added here -->
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        getCaseStudyModalHtml(data) {
             return `
                <h2 class="text-3xl font-bold mb-1 text-blue-800">${data.title}</h2>
                <div class="space-y-5 text-gray-700 mt-4 text-sm">
                    ${data.analysis}
                </div>
            `;
        },

        getEssayModalHtml(data) {
            return `
                <h2 class="text-3xl font-bold mb-1 text-green-800">${data.title}</h2>
                <p class="text-md text-gray-500 mb-4">${data.summary}</p>
                <div class="prose max-w-none text-gray-700 text-sm">
                    ${data.content}
                </div>
            `;
        }
    };

    app.init();
});


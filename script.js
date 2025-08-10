document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements by their IDs
    const mainActionButton = document.getElementById('mainActionButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const myMuseBtn = document.getElementById('myMuseBtn');
    const myLoveBtn = document.getElementById('myLoveBtn');
    const myMuseSection = document.getElementById('myMuseSection');
    const myLoveSection = document.getElementById('myLoveSection');
    const overlay = document.getElementById('overlay');
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');
    const enlargedImage = document.getElementById('enlargedImage');
    const enlargedPoemText = document.getElementById('enlargedPoemText');

    // NEW: References for navigation buttons and main content area
    // The mainContentArea ID is on the app-container div in index.html, which is a good place.
    const mainContentArea = document.getElementById('mainContentArea');
    const backToHomeLoveBtn = document.getElementById('backToHomeLoveBtn');
    const backToHomeMuseBtn = document.getElementById('backToHomeMuseBtn');
    const analyzeImageBtn = document.getElementById('analyzeImageBtn'); // New AI button


    // --- Main Button and Dropdown Logic ---

    // Toggle dropdown visibility when the main button is clicked
    if (mainActionButton) { // Ensure button exists
        mainActionButton.addEventListener('click', () => {
            dropdownMenu.classList.toggle('hidden');
        });
    }


    // Hide dropdown when clicking anywhere else on the page
    document.addEventListener('click', (event) => {
        if (!mainActionButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    // --- Section Switching Logic ---

    // NEW: Function to return to the initial home view
    function showHomeView() {
        myMuseSection.classList.add('hidden');
        myLoveSection.classList.add('hidden');
        mainActionButton.classList.remove('hidden'); // Show the main action button
        dropdownMenu.classList.add('hidden'); // Ensure dropdown is hidden
    }

    // Function to hide all content sections, show a specific one, and hide the main button
    function showSection(sectionToShow) {
        myMuseSection.classList.add('hidden');
        myLoveSection.classList.add('hidden');

        sectionToShow.classList.remove('hidden');
        dropdownMenu.classList.add('hidden');

        // Hide the main action button when a section is active
        mainActionButton.classList.add('hidden');
    }

    // Event listener for 'My Muse' button
    if (myMuseBtn) { // Ensure button exists
        myMuseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(myMuseSection);
        });
    }


    // Event listener for 'My Love' button
    if (myLoveBtn) { // Ensure button exists
        myLoveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(myLoveSection);
        });
    }


    // NEW: Event listener for Back to Home button in My Love section
    if (backToHomeLoveBtn) { // Check if the button exists before adding listener
        backToHomeLoveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showHomeView(); // Call function to return to home view
        });
    }

    // NEW: Event listener for Back to Home button in My Muse section (for when you add poems)
    if (backToHomeMuseBtn) { // Check if the button exists before adding listener
        backToHomeMuseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showHomeView();
        });
    }

    // --- Overlay (Enlarged Image/Poem) Logic ---

    // Function to show the overlay
    function showOverlay() {
        overlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden'); // Prevent scrolling while overlay is open
        // Ensure AI button and poem text are hidden by default when overlay shows for an image
        if (analyzeImageBtn) analyzeImageBtn.classList.add('hidden');
        if (enlargedPoemText) enlargedPoemText.classList.add('hidden');
    }

    // Function to hide the overlay
    function hideOverlay() {
        overlay.classList.add('hidden');
        enlargedImage.classList.add('hidden');
        enlargedImage.src = ''; // Clear image source
        enlargedPoemText.classList.add('hidden');
        enlargedPoemText.innerHTML = ''; // Clear poem text
        document.body.classList.remove('overflow-hidden'); // Re-enable scrolling
        // Reset AI button state
        if (analyzeImageBtn) {
            analyzeImageBtn.classList.add('hidden');
            analyzeImageBtn.innerHTML = 'Analyze with AI ✨'; // Reset button text
        }
    }

    // Event listener for closing the overlay button
    if (closeOverlayBtn) { // Ensure button exists
        closeOverlayBtn.addEventListener('click', hideOverlay);
    }


    // Event listener to close overlay if clicked outside the content (on the dark background)
    if (overlay) { // Ensure overlay exists
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) { // Only close if clicking on the background, not content
                hideOverlay();
            }
        });
    }


    // --- Poem Card Click Logic ---
    const poemCards = document.querySelectorAll('.poem-card');

    poemCards.forEach(card => {
        card.addEventListener('click', () => {
            const poemTitle = card.dataset.poemTitle;
            const poemText = card.dataset.poemText;

            enlargedPoemText.innerHTML = `<h3 class="text-3xl font-bold mb-4 text-center text-white">${poemTitle}</h3><p class="text-white">${poemText}</p>`;
            enlargedPoemText.classList.remove('hidden'); // Show the poem text area
            enlargedImage.classList.add('hidden'); // Hide enlarged image
            if (analyzeImageBtn) analyzeImageBtn.classList.add('hidden'); // Hide AI button when showing poem
            showOverlay();
        });
    });

    // --- Photo Click Logic ---
    const lovePhotos = document.querySelectorAll('#myLoveSection img');

    lovePhotos.forEach(photo => {
        photo.addEventListener('click', () => {
            enlargedImage.src = photo.src;
            enlargedImage.alt = photo.alt;
            enlargedImage.classList.remove('hidden');
            showOverlay();
            // Show the AI button when an image is enlarged
            if (analyzeImageBtn) analyzeImageBtn.classList.remove('hidden');
        });
    });

    // --- AI Integration ---

    async function generateImageDescription(imageAltText) {
        if (!analyzeImageBtn) return; // Exit if AI button not found

        // Display a loading state for the button
        analyzeImageBtn.innerHTML = 'Analyzing...';
        analyzeImageBtn.disabled = true; // Disable button during analysis

        // Implement exponential backoff for API calls
        const maxRetries = 5;
        let retries = 0;
        let delay = 1000; // 1 second initial delay

        while (retries < maxRetries) {
            try {
                // Prepare the prompt for the AI
                const prompt = `Generate a sweet, romantic, and thoughtful description (max 100 words) for a couple's photo, based on the following context about the image: "${imageAltText}". Make it sound like a loving partner wrote it.`;

                // Set up the payload for the Gemini API
                const payload = {
                    contents: [{
                        role: "user",
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7, // Controls randomness of output
                        maxOutputTokens: 150, // Limit response length
                    },
                    model: "gemini-2.5-flash-preview-05-20" // Specify the model
                };

                // The API key is automatically provided by Canvas when left as an empty string
                const apiKey = "";
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const aiText = result.candidates[0].content.parts[0].text;

                    // Display the AI-generated text in the poem text area
                    enlargedPoemText.innerHTML = `<h3 class="text-3xl font-bold mb-4 text-center text-white">AI's Sweet Thoughts:</h3><p class="text-white">${aiText}</p>`;
                    enlargedPoemText.classList.remove('hidden'); // Show the text area
                    enlargedImage.classList.add('hidden'); // Hide the image to show text

                    // Hide the AI button once analysis is complete and shown
                    analyzeImageBtn.classList.add('hidden');
                    return; // Exit on successful generation
                } else {
                    throw new Error('AI response structure unexpected or empty.');
                }

            } catch (error) {
                console.error("Error generating AI description:", error);
                retries++;
                if (retries < maxRetries) {
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2; // Double the delay for next retry
                } else {
                    // All retries failed
                    analyzeImageBtn.innerHTML = 'Analysis Failed 😔';
                    analyzeImageBtn.classList.remove('hidden'); // Keep button visible with error
                    enlargedPoemText.innerHTML = `<h3 class="text-3xl font-bold mb-4 text-center text-white">Oops!</h3><p class="text-red-300">Could not generate description. Please try again later.</p>`;
                    enlargedPoemText.classList.remove('hidden');
                }
            } finally {
                analyzeImageBtn.disabled = false; // Re-enable button after attempt
            }
        }
    }

    // Event listener for the AI analysis button
    if (analyzeImageBtn) { // Ensure button exists
        analyzeImageBtn.addEventListener('click', () => {
            const currentImageAlt = enlargedImage.alt; // Get the alt text of the currently enlarged image
            if (currentImageAlt && currentImageAlt !== 'Enlarged Photo') { // Ensure alt text is meaningful
                generateImageDescription(currentImageAlt);
            } else {
                enlargedPoemText.innerHTML = `<h3 class="text-3xl font-bold mb-4 text-center text-white">No Context</h3><p class="text-yellow-300">Please provide a descriptive 'alt' text for the image to get better AI analysis.</p>`;
                enlargedPoemText.classList.remove('hidden');
                analyzeImageBtn.classList.add('hidden'); // Hide button if no context
            }
        });
    }
});

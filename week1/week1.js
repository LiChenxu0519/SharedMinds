// Function to generate random RGB color
function randomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

// Set random background color and text color on page load
let backgroundColor = randomColor();
document.body.style.backgroundColor = backgroundColor;

const thoughtsDiv = document.getElementById('thoughts');

// Add event listener for input box
const thoughtInput = document.getElementById('thoughtInput');
thoughtInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        let userThought = thoughtInput.value.trim();

        if (userThought) {
            // Create new thought element
            const newThought = document.createElement('div');
            newThought.classList.add('thought');
            newThought.textContent = userThought;
            newThought.style.color = backgroundColor; // Same color as background

            // Append thought to screen
            thoughtsDiv.appendChild(newThought);
            
            // Reset input box
            thoughtInput.value = '';

            // Position the text in a random location within the screen
            newThought.style.left = Math.random() * (window.innerWidth - newThought.offsetWidth) + 'px';
            newThought.style.top = Math.random() * (window.innerHeight - newThought.offsetHeight) + 'px';
        }
    }
});

// Refresh background color each time the page loads
window.addEventListener('load', function () {
    backgroundColor = randomColor();
    document.body.style.backgroundColor = backgroundColor;
});
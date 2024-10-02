import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, onChildAdded, onChildChanged, onChildRemoved, push, update } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

let isInteracting = false;
let myName = null;
let myKey = null;
let db;
let allText = {};
let dots = [];

//make a folder in your firebase for this example
let appName = "SharedMinds2DNamedMoveTXExample";

//// New FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyAG8bAC2MKvo0sOdj8msKQswqVIE9l27Ms",
    authDomain: "sharedminds-9b0a3.firebaseapp.com",
    projectId: "sharedminds-9b0a3",
    storageBucket: "sharedminds-9b0a3.appspot.com",
    messagingSenderId: "626634342188",
    appId: "1:626634342188:web:65752f53a50944663ab689"
};

login();
initInterface();
initFirebase();

function login() {
    myName = prompt("What is your name?");
    if (myName == null || myName === "") {
        const now = new Date();
        myName = now.toLocaleString();
    }
}

function drawAll() {
    const ctx = document.getElementById('myCanvas').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas
    ctx.font = '30px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText("Hello " + myName, ctx.canvas.width - 200, 30);

    dots = [];  // Clear dots array
    for (const key in allText) {
        const textData = allText[key];
        let thisName = textData.name;
        if (thisName === myName) myKey = key; // Keep track of your key

        // Draw dots instead of text
        ctx.beginPath();
        ctx.arc(textData.position.x, textData.position.y, 10, 0, Math.PI * 2, true);  // Draw a circle
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();

        // Add the dot to the dots array for click detection
        dots.push({ key, x: textData.position.x, y: textData.position.y });
    }
}

function initFirebase() {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    let folder = 'texts';
    // Get callbacks when there are changes either by you locally or others remotely
    const commentsRef = ref(db, appName + '/' + folder + '/');
    onChildAdded(commentsRef, (data) => {
        allText[data.key] = data.val(); // Adds it
        drawAll();
    });
    onChildChanged(commentsRef, (data) => {
        allText[data.key] = data.val();
        drawAll();
    });
    onChildRemoved(commentsRef, (data) => {
        delete allText[data.key]; // Removes it
        drawAll();
    });
}

function setInFirebase(folder, data) {
    // Firebase will supply the key, this will trigger "onChildAdded"
    if (myKey) {
        const dbRef = ref(db, appName + '/' + folder + '/' + myKey);
        update(dbRef, data);
    } else {
        // If it doesn't exist, add (push) and collect the key for later updates
        const dbRef = ref(db, appName + '/' + folder + '/');
        myKey = push(dbRef, data).key;
    }
}

function initInterface() {
    // Get the input box and the canvas element
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'myCanvas');
    canvas.style.position = 'absolute';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    document.body.appendChild(canvas);

    const inputBox = document.createElement('input');
    inputBox.setAttribute('type', 'text');
    inputBox.setAttribute('id', 'inputBox');
    inputBox.setAttribute('placeholder', 'Enter text here');
    inputBox.style.position = 'absolute';
    inputBox.style.left = '50%';
    inputBox.style.top = '50%';
    inputBox.style.transform = 'translate(-50%, -50%)';
    inputBox.style.zIndex = '100';
    inputBox.style.fontSize = '30px';
    inputBox.style.fontFamily = 'Arial';
    document.body.appendChild(inputBox);

    // Add event listener to the input box
    inputBox.addEventListener('keydown', function (event) {
        // Check if the Enter key is pressed
        if (event.key === 'Enter') {
            const inputValue = inputBox.value;
            if (inputValue.trim() !== "") {
                // Generate random position for the dot
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;

                // Add the text to the database
                const data = {
                    name: myName,
                    type: 'text',
                    position: { x: x, y: y },
                    text: inputValue
                };
                setInFirebase('texts', data);
                inputBox.value = '';  // Clear the input box after submission
            }
        }
    });

    // Handle dot click to show text
    document.addEventListener('click', function (event) {
        const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext('2d');
        const clickX = event.clientX;
        const clickY = event.clientY;

        // Check if the click is on any of the dots
        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];
            const distance = Math.sqrt(Math.pow(dot.x - clickX, 2) + Math.pow(dot.y - clickY, 2));
            if (distance < 10) {
                const textData = allText[dot.key];
                if (textData) {
                    // Show the text at the dot's position
                    ctx.font = '24px Arial';
                    ctx.fillStyle = 'black';
                    ctx.fillText(textData.text, dot.x, dot.y - 20);  // Display above the dot
                }
                break;
            }
        }
    });
}

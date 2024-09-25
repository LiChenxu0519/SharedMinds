const replicateProxy = "https://replicate-api-proxy.glitch.me";
let feedback;
let img;

function setup() {
  // Create the canvas inside the canvasContainer div
  let canvas = createCanvas(512, 512);
  canvas.parent('canvasContainer');
  
  feedback = select("#feedback");

  // Get the button and set up the event listener
  let button = select("#askButton");
  button.mousePressed(() => {
    let userInput = select("#input_image_prompt").value();
    askForPicture(userInput); // Use the input length to affect the image
  });
}

function draw() {
  if (img) {
    image(img, 0, 0, width, height);
  }
}

async function askForPicture(userInput) {
  // Define different flower variations based on input length
  const inputLength = userInput.length;
  
  // Adjust the prompt based on the input length
  const flowerPrompt = `one flower in pixel art style on a white background, highly detailed in ${inputLength} colors.`;
  
  feedback.html("Waiting for reply from Replicate's Stable Diffusion API...");

  let data = {
    version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // Stable Diffusion model version
    input: {
      prompt: flowerPrompt,  // Use the dynamic prompt based on user input
      negative_prompt: "",
      num_inference_steps: 50,
      guidance_scale: 7.5,
      seed: inputLength * 1000 + Math.floor(Math.random() * 100), // Randomize seed based on input length
    },
  };

  console.log("Asking for Picture Info From Replicate via Proxy", data);
  
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  const url = replicateProxy + "/create_n_get/";
  try {
    const picture_info = await fetch(url, options);
    const proxy_said = await picture_info.json();
    
    if (proxy_said.output.length == 0) {
      feedback.html("Something went wrong, try again");
    } else {
      feedback.html("");
      loadImage(proxy_said.output[0], (incomingImage) => {
        img = incomingImage;
      });
    }
  } catch (error) {
    console.error("Error fetching the image:", error);
    feedback.html("Failed to fetch the image.");
  }
}


fetch('/Week3/data.json')
  .then(response => response.json())
  .then(data => {
    console.log("Loaded prompts from JSON", data.prompts);
    // Use the prompts or other data here
  })
  .catch(error => console.error("Error loading JSON data:", error));

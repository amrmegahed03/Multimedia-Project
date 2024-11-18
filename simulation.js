// Function to start the simulation when the button is clicked
function startSimulation() {
    // Get input values from the form
    const startTime = parseInt(document.getElementById("startTime").value);
    const packetCount = parseInt(document.getElementById("packetCount").value);
    const networkDelay = parseInt(document.getElementById("networkDelay").value);
    const playbackDelay = parseInt(document.getElementById("playbackDelay").value);

    const canvas = document.getElementById("simulationCanvas");
    canvas.height = 40 * packetCount + 100;
    canvas.width = 50 * (playbackDelay + packetCount) + 150;

    // Call function to draw the grid and axes
    drawGrid(packetCount, playbackDelay);

    // Create an array to store the generation time of each packet
    let generationTimes = [];
    let calculatedDelay = [];
    let networkDelayCurveTimes=[];
    let lostPackets=[];
    let playbackDelayTimes =[];
    
    // Calculate generation times for each packet and store them in the array
    for (let i = 0; i <= packetCount; i++) {
        const generationTime = startTime + i;  // Add a time increment for each packet
        generationTimes.push(generationTime); // Store the generation time in the array
    }

    for(let i=0 ; i<=packetCount ; i++){
        // Random delay between more than 0 and less than or equal to network delay
        const randomDelay = Math.ceil(Math.random() * (networkDelay + 1));
        //check that the random delay is not 0
        while(randomDelay == 0){
            randomDelay = Math.ceil(Math.random() * (networkDelay + 1));
        }
        calculatedDelay.push(randomDelay);
    }

    for (let i = 0; i <= packetCount; i++) {
        const networkDelayTime = generationTimes[i] + calculatedDelay[i]; // Calculate the network delay time
        
        // Check if networkDelayTime is smaller than or equal to the previous value
        if (i === 0 || networkDelayTime <= networkDelayCurveTimes[i - 1]) {
            // If it's the first packet or the time is less than or equal to the previous one, use the previous time
            if (i > 0) {
                networkDelayCurveTimes.push(networkDelayCurveTimes[i - 1]);
            } else {
                networkDelayCurveTimes.push(networkDelayTime);  // For the first packet, store the first calculated time
            }
        } else {
            // If the network delay time is larger than the previous one, store it
            networkDelayCurveTimes.push(networkDelayTime);
        }
    }

    for(let i = 0 ; i<=packetCount ; i++){
        const playbackTime = generationTimes[i] + playbackDelay;
        playbackDelayTimes.push(playbackTime);
    }

    for(let i = 0 ; i<=packetCount ; i++){
        if(networkDelayCurveTimes[i] == networkDelayCurveTimes[i+1]){
            lostPackets[i] = networkDelayCurveTimes[i];
        }
        else{
            lostPackets[i] = 0;
        }
    }
    

    console.log("Generation Times: ", generationTimes);
    console.log("calculated Delay: ", calculatedDelay);
    console.log("Network Delay Curve Times:" , networkDelayCurveTimes);
    console.log("PlayBack Times :" , playbackDelayTimes);
    console.log("Lost Packets : " , lostPackets);
    
    drawPacketGenerationCurve(generationTimes);
    drawNetworkDelayCurve(networkDelayCurveTimes);
    drawplayDelayCurve(playbackDelayTimes);
    drawlostCurve(lostPackets , networkDelayCurveTimes)
}

// Function to draw the grid with x-axis and y-axis on the canvas
function drawGrid(packetCount, playbackDelay) {
    // Get the canvas element and its context
    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set scaling factors and offsets for the grid
    const xScale = 50;  // Space between each x-axis label
    const yScale = 40;  // Space between each y-axis label
    const offsetX = 50; // Starting position of the x-axis
    const offsetY = canvas.height - 30; // Starting position of the y-axis (bottom of canvas)

    // Draw the grid
    ctx.beginPath();
    ctx.strokeStyle = "#e0e0e0"; // Light gray color for the grid

    // Draw vertical grid lines (x-axis)
    for (let x = offsetX; x < canvas.width; x += xScale) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }

    // Draw horizontal grid lines (y-axis)
    for (let y = offsetY; y > 0; y -= yScale) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }

    ctx.stroke();

    // Draw the x and y axes
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(offsetX, offsetY); // x-axis
    ctx.lineTo(canvas.width, offsetY); 
    ctx.moveTo(offsetX, offsetY); // y-axis
    ctx.lineTo(offsetX, 0);
    ctx.stroke();

    // Draw labels on the axes
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.fillText("Packets", 10, offsetY - packetCount * yScale); // Label for y-axis
    ctx.fillText("Time", canvas.width - 30, offsetY + 20); // Label for x-axis
   // ctx.fillText("Packets", offsetX - 30, packetCount); // Label for y-axis

    // Draw fixed y-axis labels
    const maxPackets = packetCount +1;
    for (let i = 0; i <= maxPackets; i++) {
        ctx.fillText(i, offsetX - 20, offsetY - i * yScale);
    }

    // Draw x-axis labels
    const maxTime = playbackDelay + packetCount ; // Maximum time value for the x-axis
    for (let i = 0; i <= maxTime; i++) {
        ctx.fillText(i, offsetX + i * xScale, offsetY + 20); // x-axis labels
    }
}

// Function to draw the packet generation curve using the array of generation times
function drawPacketGenerationCurve(generationTimes) {
    // Get the canvas element and its context
    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");

    // Set scaling factors
    const xScale = 50;  // Space between each x-axis label
    const yScale = 40;  // Space between each y-axis label
    const offsetX = 50; // Starting position of the x-axis
    const offsetY = canvas.height - 70; // Starting position of the y-axis (bottom of canvas)

    // Set color for the packet generation curve
    ctx.beginPath();
    ctx.strokeStyle = "blue"; // Curve color for packet generation

    // Start at the x position corresponding to the first generation time (startTime) and y position for packet 0
    ctx.moveTo(offsetX + generationTimes[0] * xScale, offsetY - 0 * yScale);

    // Draw the curve as a staircase (no diagonals, just horizontal and vertical lines)
        

        for (let i = 0; i < generationTimes.length-1; i++) {
            const time = generationTimes[i];  
            const packetCountAtTime = i;  
            ctx.lineTo(offsetX + time * xScale, offsetY - (packetCountAtTime - 1) * yScale);
            ctx.lineTo(offsetX + time * xScale, offsetY - packetCountAtTime * yScale);
        }
    
    

    // Stroke the path (actually draw it on the canvas)
    ctx.stroke();
}


function drawNetworkDelayCurve(networkDelayCurveTimes) {
    // Get the canvas element and its context
    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");

    // Set scaling factors
    const xScale = 50;  // Space between each x-axis label (time)
    const yScale = 40;  // Space between each y-axis label (packet count)
    const offsetX = 50; // Starting position of the x-axis
    const offsetY = canvas.height - 70; // Starting position of the y-axis (bottom of canvas)

    // Set color for the network delay curve
    ctx.beginPath();
    ctx.strokeStyle = "purple"; // Curve color for network delay

    // Start from the first packet (y = 0) and the first network delay time (x = networkDelayCurveTimes[0])
    ctx.moveTo(offsetX + networkDelayCurveTimes[0] * xScale, offsetY - 0 * yScale); // Start from packet 0

    // Draw the curve as a staircase
    for (let i = 0; i < networkDelayCurveTimes.length - 1; i++) {
        const time = networkDelayCurveTimes[i];  // The x-coordinate will be based on the network delay time
        const packetCountAtTime = i;  // The y-coordinate increases sequentially as packets arrive

        // Draw horizontal line (move to the next time step on x-axis)
        ctx.lineTo(offsetX + time * xScale, offsetY - (packetCountAtTime - 1) * yScale);

        // Draw vertical line (move to the current packet count on y-axis)
        ctx.lineTo(offsetX + time * xScale, offsetY - packetCountAtTime * yScale);
    }

    // Stroke the path (actually draw it on the canvas)
    ctx.stroke();
}

function drawplayDelayCurve(playbackDelayTimes) {
    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");
    const xScale = 50;  
    const yScale = 40; 
    const offsetX = 50; 
    const offsetY = canvas.height - 70; 
    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.moveTo(offsetX + playbackDelayTimes[0] * xScale, offsetY - 0 * yScale); 

    for (let i = 0; i < playbackDelayTimes.length-1; i++) {
        const time = playbackDelayTimes[i];  
        const packetCountAtTime = i;  
        ctx.lineTo(offsetX + time * xScale, offsetY - (packetCountAtTime - 1) * yScale);
        ctx.lineTo(offsetX + time * xScale, offsetY - packetCountAtTime * yScale);
    }
    ctx.stroke();
}














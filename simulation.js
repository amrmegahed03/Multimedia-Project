
function startSimulation() {
    const startTime = parseInt(document.getElementById("startTime").value);
    const packetCount = parseInt(document.getElementById("packetCount").value);
    const networkDelay = parseInt(document.getElementById("networkDelay").value);
    const playbackDelay = parseInt(document.getElementById("playbackDelay").value);
    const bufferSize = parseInt(document.getElementById("bufferSize").value);

    const canvas = document.getElementById("simulationCanvas");
    canvas.height = 40 * packetCount + 100;

    let generationTimes = [];
    let receivingTimes=[];
    let lostPackets=[];
    let playbackTimes =[];
    let buffer = Array(bufferSize).fill(0);
    let bufferTimes = [];
    let noofpacketsatatime = [];

    let lostPacketCount = 0;
    let receivedPacketCount = 0;
    let playbackPacketCount = 0;
    let bufferPacketCount = 0;

    for (let i = 0; i < packetCount; i++) {
        const generationTime = startTime + i;
        generationTimes.push(generationTime);
    }

    for(let i=0 ; i < packetCount ; i++){
        const randomDelay = Math.ceil(Math.random() * (networkDelay + 1));
        while(randomDelay == 0){
            randomDelay = Math.ceil(Math.random() * (networkDelay + 1));
        }
        receivingTimes.push(generationTimes[i] + randomDelay);
    }

    for(let i = 0 ; i < packetCount ; i++){
        const playbackTime = generationTimes[i] + playbackDelay;
        playbackTimes.push(playbackTime);
        if(receivingTimes[i] > playbackTime){
            lostPackets.push(i+1);
            lostPacketCount++;
        }else{
            receivedPacketCount++;
        }
    }

    let maxtime ;
    if (receivingTimes[packetCount-1] > playbackTimes[packetCount-1]){
        maxtime = receivingTimes[packetCount-1] + 3;
    }else{
        maxtime = playbackTimes[packetCount-1] + 3;
    }

    canvas.width = maxtime * 50 + 150;
    canvas.height = 40 * packetCount + 100;

    let maxbuffercount = 0;

    console.log("Generation Times: ", generationTimes);
    console.log("Receiving Times: ", receivingTimes);
    console.log("Lost Packets: ", lostPackets);
    console.log("Playback Times: ", playbackTimes);

    for(let i = 0 ; i < maxtime ; i++){
        for(let j = 0 ; j < packetCount ; j++){
            if (receivingTimes[j] == i && !lostPackets.includes(j+1)){
                if(bufferPacketCount < bufferSize){
                    buffer[bufferPacketCount] = j+1;
                    bufferPacketCount++;
                    bufferTimes.push(i);
                    if(bufferPacketCount > maxbuffercount){
                        maxbuffercount = bufferPacketCount;
                    }
                }else{
                    lostPackets.push(j);
                    lostPacketCount++;
                }
            }
        }
        for(let j = 0 ; j < packetCount ; j++){
            if (playbackTimes[j] == i){
                let packet = j+1;
                for(let k = 0 ; k < bufferSize ; k++){
                    if(buffer[k] == packet){
                        for(let l = k ; l < bufferSize -1 ; l++){
                            buffer[l] = buffer[l+1];
                        }
                        if(bufferPacketCount >0 ){
                            bufferPacketCount--;
                        }
                        bufferTimes.push(i);                      
                        playbackPacketCount++;
                    }
                }
            }
        }
        noofpacketsatatime.push(bufferPacketCount);
        console.log("Time: ", i);
        console.log("Buffer: ", buffer);
        console.log("Buffer Packet Count: ", bufferPacketCount);

    } 
    drawGrid(packetCount, maxtime);   
    drawPacketGenerationCurve(generationTimes);
    drawRecievedNetworkCurve(receivingTimes);
    drawplayDelayCurve(playbackTimes,lostPackets);
    drawbuffer(bufferTimes,lostPackets,playbackTimes,receivingTimes,maxtime, noofpacketsatatime);
    //  drawlost(playbackTimes,lostPackets);
    


    let avgBuffer = 0;  
    let sumbuffer = 0;
    let numbuffer = 0;
    for (let i = receivingTimes[0]; i <= playbackTimes[packetCount-1];i++){
        sumbuffer += noofpacketsatatime[i];
        numbuffer++;
    }
    avgBuffer = sumbuffer / numbuffer;
    document.getElementById("avgBufferSize").textContent = avgBuffer;
    document.getElementById("minBufferSize").textContent = maxbuffercount;
    document.getElementById("lostPackets").textContent = lostPackets;

}

function drawGrid(packetCount, maxTime) {
    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const xScale = 50;  
    const yScale = 40;  
    const offsetX = 50; 
    const offsetY = canvas.height - 30; 

    ctx.beginPath();
    ctx.strokeStyle = "#e0e0e0"; 

    for (let x = offsetX; x < canvas.width; x += xScale) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }

    for (let y = offsetY; y > 0; y -= yScale) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }

    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(offsetX, offsetY); 
    ctx.lineTo(canvas.width, offsetY); 
    ctx.moveTo(offsetX, offsetY); 
    ctx.lineTo(offsetX, 0);
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.fillText("Packets", 10, offsetY - packetCount * yScale); 
    ctx.fillText("Time", canvas.width - 30, offsetY + 20); 

    const maxPackets = packetCount +1;
    for (let i = 0; i <= maxPackets; i++) {
        ctx.fillText(i, offsetX - 20, offsetY - i * yScale);
    }

    const maxtime = maxTime ; 
    for (let i = 0; i <= maxtime; i++) {
        ctx.fillText(i, offsetX + i * xScale, offsetY + 20); 
    }
}

function drawPacketGenerationCurve(generationTimes) {
    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");

    const xScale = 50;  
    const yScale = 40;  
    const offsetX = 50; 
    const offsetY = canvas.height - 70; 

    ctx.beginPath();
    ctx.strokeStyle = "blue"; 

    ctx.moveTo(offsetX + generationTimes[0] * xScale, offsetY - 0 * yScale);        

        for (let i = 0; i < generationTimes.length; i++) {
            const time = generationTimes[i];  
            const packetCountAtTime = i;  
            ctx.lineTo(offsetX + time * xScale, offsetY - (packetCountAtTime - 1) * yScale);
            ctx.lineTo(offsetX + time * xScale, offsetY - packetCountAtTime * yScale);
        }
    
    

    ctx.stroke();
}

function drawRecievedNetworkCurve(networkDelayCurveTimes) {
    networkDelayCurveTimes.sort((a, b) => a - b);

    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");

    const xScale = 50;  
    const yScale = 40;  
    const offsetX = 50; 
    const offsetY = canvas.height - 70;

    ctx.beginPath();
    ctx.strokeStyle = "purple"; 
    
    ctx.moveTo(offsetX + networkDelayCurveTimes[0] * xScale, offsetY - 0 * yScale); 

    for (let i = 0; i < networkDelayCurveTimes.length ; i++) {
        const time = networkDelayCurveTimes[i]; 
        const packetCountAtTime = i;  
        
        ctx.lineTo(offsetX + time * xScale, offsetY - (packetCountAtTime - 1) * yScale);

        ctx.lineTo(offsetX + time * xScale, offsetY - packetCountAtTime * yScale);
    }
    ctx.stroke();
}

function drawplayDelayCurve(playbackDelayTimes, lostPackets) {
    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");

    const xScale = 50;  // Scale for the x-axis (time)
    const yScale = 40;  // Scale for the y-axis (packet count)
    const offsetX = 50; // Horizontal offset for the grid
    const offsetY = canvas.height - 70; // Vertical offset for the grid

    ctx.beginPath();
    ctx.strokeStyle = "green"; // Color for the playback delay curve

    let prevPacketCount = 0; // Initialize previous packet count to 0

    // Start the graph at the first point
    ctx.moveTo(offsetX + playbackDelayTimes[0] * xScale, offsetY +1*yScale);
    console.log(offsetY   *yScale);
    console.log(offsetY -0  *yScale);





    for (let i = 0; i < playbackDelayTimes.length; i++) {
        const time = playbackDelayTimes[i];  // Time when packet is played
        const packetCountAtTime = i;  // Count of packets played at this time
        /*
        // If the packet was lost, skip it
        if (lostPackets.includes(i)) {
            continue;
        }
*/
        // Draw the vertical line to represent packet playback at this time
        ctx.lineTo(offsetX + time * xScale, offsetY - prevPacketCount * yScale);

        // Draw the horizontal line to continue the curve at the same packet count
        ctx.lineTo(offsetX + time * xScale, offsetY - packetCountAtTime * yScale);

        // Update the previous packet count
        prevPacketCount = packetCountAtTime;
    }

    ctx.stroke();
}

function drawbuffer(bufferTimes, lostPackets, playbackTimes, receivingTimes, maxtime, noofpacketsatatime) {
    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");

    const xScale = 50;  // Scale for the x-axis (time)
    const yScale = 40;  // Scale for the y-axis (buffer size)
    const offsetX = 50; // Horizontal offset for the grid
    const offsetY = canvas.height - 30; // Vertical offset for the grid

    ctx.beginPath();
    ctx.strokeStyle = "red";  // Red color for the buffer line
    ctx.setLineDash([]); // No dashes for the buffer line

    let bufferCount = 0; // Start buffer count at 0
    let firstPacketReceived = false;

    for (let i = 0; i < maxtime; i++) {
        // Determine the current buffer count (clipped to 0 to prevent negative values)
        const currentBuffer = Math.max(0, noofpacketsatatime[i]);

        if (!firstPacketReceived && currentBuffer > 0) {
            // Mark that the first packet has been received
            firstPacketReceived = true;
        }

        // Draw the buffer line
        if (i === 0) {
            // Initial point at time 0 with buffer count 0
            ctx.moveTo(offsetX, offsetY - 0 * yScale);
        } else {
            const prevBuffer = Math.max(0, noofpacketsatatime[i - 1]);

            if (currentBuffer !== prevBuffer) {
                // Vertical step
                ctx.lineTo(offsetX + i * xScale, offsetY - prevBuffer * yScale);
                // Horizontal step
                ctx.lineTo(offsetX + i * xScale, offsetY - currentBuffer * yScale);
            } else {
                // Continue horizontally if the buffer count remains unchanged
                ctx.lineTo(offsetX + i * xScale, offsetY - currentBuffer * yScale);
            }
        }

        // Update buffer count for the next iteration
        bufferCount = currentBuffer;
    }

    ctx.stroke();
}




//function to draw lost packets in a dootted line
function drawlost(playbackTimes,lostPackets) {
    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");
    const xScale = 50;  
    const yScale = 40; 
    const offsetX = 50; 
    const offsetY = canvas.height - 70; 
    ctx.beginPath();
    ctx.strokeStyle = "yellow";
    ctx.setLineDash([5, 5]);
    ctx.moveTo(offsetX + playbackTimes[0] * xScale, offsetY - 0 * yScale);
    for (let i = 0; i < playbackTimes.length; i++){
        if(lostPackets.includes(i)){
            ctx.lineTo(offsetX + playbackTimes[i] * xScale, offsetY - 0 * yScale);
            ctx.lineTo(offsetX + playbackTimes[i] * xScale, offsetY - 1 * yScale);
        }
    }
    ctx.stroke();
}



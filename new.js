function startSimulation() {
    const startTime = parseInt(document.getElementById("startTime").value);
    const packetCount = parseInt(document.getElementById("packetCount").value);
    const networkDelay = parseInt(document.getElementById("networkDelay").value);
    const playbackDelay = parseInt(document.getElementById("playbackDelay").value);
    const bufferSize = parseInt(document.getElementById("bufferSize").value);

    const canvas = document.getElementById("simulationCanvas");
    canvas.height = 40 * packetCount + 100;

    let generationTimes = [];
    //let calculatedDelay = [];
    let receivingTimes=[];
    let lostPackets=[];
    let playbackTimes =[];
    let buffer = Array(bufferSize).fill(0);

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

    //calculate playback times and decide if the packet is lost or not
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
                            bufferPacketCount--;
                        
                        playbackPacketCount++;
                    }
                }
            }
        }
        console.log("Time: ", i);
        console.log("Buffer: ", buffer);
        console.log("Buffer Packet Count: ", bufferPacketCount);

    }    
}
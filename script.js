const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

video.addEventListener('play', function() {
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    function drawFrame() {
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

        const frameData = ctx.getImageData(0, 0, videoWidth, videoHeight);

        const edgeImageData = detectEdges(frameData);

        ctx.putImageData(edgeImageData, 0, 0);

        requestAnimationFrame(drawFrame);
    }

    drawFrame();
});

function detectEdges(frameData) {
    const threshold = 40;

    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];

    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    const width = frameData.width;
    const height = frameData.height;
    const data = frameData.data;

    const resultData = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sumX = 0;
            let sumY = 0;

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const pixelIndex = ((y + i) * width + (x + j)) * 4;
                    const weightX = sobelX[i + 1][j + 1];
                    const weightY = sobelY[i + 1][j + 1];

                    sumX += weightX * data[pixelIndex];
                    sumY += weightY * data[pixelIndex];
                }
            }

            const gradientMagnitude = Math.sqrt(sumX * sumX + sumY * sumY);
            const edgeValue = gradientMagnitude > threshold ? 255 : 0;

            const pixelIndex = (y * width + x) * 4;
            resultData[pixelIndex] = edgeValue;
            resultData[pixelIndex + 1] = edgeValue;
            resultData[pixelIndex + 2] = edgeValue;
            resultData[pixelIndex + 3] = 255;
        }
    }

    return new ImageData(resultData, width, height);
}

video.addEventListener('pause', function() {
    console.log('Video is paused');
    var pauseMessage = document.getElementById('pauseMessage');
    pauseMessage.style.display = "block";

    setTimeout(function() {
        pauseMessage.style.display = "none";
    }, 3000);
});

video.addEventListener('timeupdate', function() {
    console.log('Current time: ' + video.currentTime);
    drawImageOnCanvas();
});

function playVideo() {
    video.play();
}

function pauseVideo() {
    video.pause();
}

function restartVideo() {
    video.currentTime = 0;
}

video.onloadeddata = function() {
    console.log('Video is loaded');
};
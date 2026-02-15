$(function () {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    $('#zoomquilt').append(canvas);

    let width, height, centerX, centerY;
    let targetZ = 0;   // Where the scroll wants to be
    let currentZ = 0;  // Where the zoom actually is (for smoothing)
    let images = [];
    let loadedCount = 0;
    const totalImages = 7; // Your 8 Van Gogh images

    // 1. Load images 1.jpg through 8.jpg
    for (let i = 1; i <= totalImages; i++) {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            $('#loadbar').css('width', (loadedCount / totalImages * 100) + '%');
            if (loadedCount === totalImages) {
                $('#loader').fadeOut(1000);
                render();
            }
        };
        img.src = `${i}.jpg`;
        images.push(img);
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = canvas.width = window.innerWidth * dpr;
        height = canvas.height = window.innerHeight * dpr;
        centerX = width / 2;
        centerY = height / 2;
    }

    $(window).on('resize', resize);
    resize();

    // 2. Scroll Listener
    $(window).on('scroll', () => {
        // Adjust 0.0015 to change how "fast" the zoom responds to your wheel
        targetZ = window.scrollY * 0.0015;
    });

    function render() {
        // 3. Smooth Lerp (Current position catches up to Target position)
        currentZ += (targetZ - currentZ) * 0.07;

        ctx.clearRect(0, 0, width, height);

        const spacing = 1.0;
        const steps = 6; // How many layers to draw at once

        for (let i = steps; i >= 0; i--) {
            // Logic to loop the 8 images infinitely
            let layerZ = currentZ - i * spacing;

            // This ensures we always have a positive index for our images array
            let index = Math.floor(layerZ) % totalImages;
            if (index < 0) index += totalImages;

            let img = images[index];

            // Exponential scale (The Zoomquilt magic)
            let progress = (layerZ % spacing + spacing) % spacing;
            let scale = Math.pow(2, progress + i);

            // Draw the image
            let w = width * scale;
            let h = height * scale;
            let x = centerX - w / 2;
            let y = centerY - h / 2;

            // Fade out the image as it gets too large/close to the "camera"
            let opacity = 1;
            if (scale > 3) opacity = Math.max(0, 1 - (scale - 3) / 5);
            ctx.globalAlpha = opacity;

            if (img.complete) {
                ctx.drawImage(img, x, y, w, h);
            }
        }

        requestAnimationFrame(render);
    }
});
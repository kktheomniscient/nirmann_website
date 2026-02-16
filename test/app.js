$(function () {

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    $('#zoomquilt').append(canvas);

    let width, height, centerX, centerY;

    let targetZ = 0;   // Scroll target
    let currentZ = 0;  // Smoothed zoom position

    let images = [];
    let loadedCount = 0;

    const totalImages = 7; // Number of images
    const spacing = 1.0;
    const steps = 6;

    // -----------------------
    // Load Images
    // -----------------------
    for (let i = 1; i <= totalImages; i++) {

        const img = new Image();

        img.onload = () => {

            loadedCount++;

            $('#loadbar').css(
                'width',
                (loadedCount / totalImages * 100) + '%'
            );

            if (loadedCount === totalImages) {

                $('#loader').fadeOut(1000);
                render();

            }
        };

        img.src = `${i}.jpg`;
        images.push(img);
    }

    // -----------------------
    // Resize
    // -----------------------
    function resize() {

        const dpr = window.devicePixelRatio || 1;

        width = canvas.width = window.innerWidth * dpr;
        height = canvas.height = window.innerHeight * dpr;

        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';

        centerX = width / 2;
        centerY = height / 2;
    }

    $(window).on('resize', resize);
    resize();

    // -----------------------
    // Scroll listener
    // -----------------------
    $(window).on('scroll', () => {

        targetZ = window.scrollY * 0.0015;

    });

    // -----------------------
    // Smoothstep easing
    // -----------------------
    function smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    // -----------------------
    // Render Loop
    // -----------------------
    function render() {

        requestAnimationFrame(render);

        // Smooth interpolation
        currentZ += (targetZ - currentZ) * 0.07;

        ctx.clearRect(0, 0, width, height);

        for (let i = steps; i >= 0; i--) {

            let layerZ = currentZ - i * spacing;

            // Base index
            let baseIndex = Math.floor(layerZ);
            let nextIndex = baseIndex + 1;

            baseIndex = ((baseIndex % totalImages) + totalImages) % totalImages;
            nextIndex = ((nextIndex % totalImages) + totalImages) % totalImages;

            let imgA = images[baseIndex];
            let imgB = images[nextIndex];

            // Progress between images
            let progress = (layerZ % spacing + spacing) % spacing;
            let blend = smoothstep(progress);

            // Exponential scale
            let scale = Math.pow(2, progress + i);

            let w = width * scale;
            let h = height * scale;

            let x = centerX - w / 2;
            let y = centerY - h / 2;

            // Fade when too close
            let opacity = 1;
            if (scale > 3) {
                opacity = Math.max(0, 1 - (scale - 3) / 5);
            }

            // Draw image A
            if (imgA.complete) {

                ctx.globalAlpha = opacity * (1 - blend);
                ctx.drawImage(imgA, x, y, w, h);

            }

            // Draw image B
            if (imgB.complete) {

                ctx.globalAlpha = opacity * blend;
                ctx.drawImage(imgB, x, y, w, h);

            }

        }

        ctx.globalAlpha = 1;
    }

});

var pixelWidth = 8,
    pixelHeight = 8,
    cursorOffset = 20,
    cursorLineW = 2,
    pixelColor = 'grey';

document.addEventListener('DOMContentLoaded', function () {
    var mouse = {};
    var startpos, endpos, flag = 0, imageflag = 0;
    var canvas = document.getElementsByTagName('canvas')[0];
    var ctx = canvas.getContext('2d');
    var div = document.getElementById("divInfo");
    var divMint = document.getElementById("divMint");
    var spanPos = document.getElementById("spanPos");
    var spanPixel = document.getElementById("spanPixel");
    var spanCount = document.getElementById("spanCount");
    const buttonMint = document.getElementById("buttonMint");
    var buttonClose = document.getElementById("buttonClose");

    buttonClose.onclick = function (e) {
        e.preventDefault();
        flag = 0;
        divMint.style.display = 'none';
    }

    buttonMint.onclick = function () {
        this.value = null;
      };

    buttonMint.onchange = onFileChosen;

    canvas.width = 800;
    canvas.height = 800;

    var myGif = [], gifPos = [], gifCount = 0;
    var myImg = [], imgPos = [], imgCount = 0;

    var imgData;

    function showImages() {
        for(var i = 0; i < imgData.length; i ++) {
            if(imgData[i].src.includes('.gif')) {
                const temp = gifCount;
                const src = imgData[i].src;
                setTimeout(() => {
                    myGif[temp] = GIF();
                    myGif[temp].onerror = function (e) {
                        console.log("Gif loading error " + e.type);
                    }
                    myGif[temp].load(src);
    
                }, 0);
                var temp1 = {};
                temp1.x = imgData[i].x * pixelWidth;
                temp1.y = imgData[i].y * pixelHeight;
                temp1.width = imgData[i].w * pixelWidth;
                temp1.height = imgData[i].h * pixelHeight;
                gifPos[gifCount] = temp1;
                gifCount ++;
            }
            else {
                var temp1 = {};
                myImg[imgCount] = imgData[i].src;
                temp1.x = imgData[i].x * pixelWidth;
                temp1.y = imgData[i].y * pixelHeight;
                temp1.width = imgData[i].w * pixelWidth;
                temp1.height = imgData[i].h * pixelHeight;
                imgPos[imgCount] = temp1;
                imgCount ++;
            }
        }
        if((gifCount + imgCount) > 0) {
            imageflag = 1;
        }
    }

    fetch("./import.json")
        .then(response => response.json())
        .then(data => imgData = data)
        .then(showImages);    

    //Clear grid;
    function drawGrid() {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.2)';
        var x = 0, y = 0;
        while (x <= canvas.width) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            x += pixelWidth;
        }
        while (y <= canvas.height) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            y += pixelHeight;
        }
        ctx.stroke();
    }

    function getMousePos(event) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: (Math.round((event.clientX - rect.left - (pixelWidth / 2)) / pixelWidth) * pixelWidth),
            y: (Math.round((event.clientY - rect.top - (pixelHeight / 2)) / pixelHeight) * pixelHeight)
        };
    }

    function clearCanvas() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        /*if(flag == 2) {
            ctx.fillStyle = 'rgba(180, 0, 0, 0.2)';
            ctx.fillRect(startpos.x, startpos.y, endpos.x - startpos.x + pixelWidth, endpos.y - startpos.y + pixelHeight);
            
        }*/
    }

    function getPixelCount() {
        var x = startpos.x > endpos.x ? startpos.x - endpos.x : endpos.x - startpos.x;
        var y = startpos.y > endpos.y ? startpos.y - endpos.y : endpos.y - startpos.y;
        return (x / 8 + 1) * (y / 8 + 1);
    }

    function drawImage() {
        var p = 0;        
        if(imageflag == 1) 
        {
            for(var i = 0; i < gifCount;  i ++) {
                if (myGif[i]) {
                    if (!myGif[i].loading) { 
                        ctx.drawImage(myGif[i].image, gifPos[i].x, gifPos[i].y, gifPos[i].width, gifPos[i].height);
                    }
                }
            }
            for(var i = 0; i < imgCount;  i ++) {
                var oImg = document.createElement("img");
                oImg.setAttribute('src', myImg[i]);
                oImg.setAttribute('class', 'preview-image');

                ctx.drawImage(oImg, imgPos[i].x, imgPos[i].y, imgPos[i].width, imgPos[i].height);
            }
        }
        if(flag != 0){
            if(flag == 1)
                endpos = mouse;
            ctx.fillStyle = 'rgba(180, 0, 0, 0.2)';
            ctx.fillRect(startpos.x, startpos.y, endpos.x - startpos.x + pixelWidth, endpos.y - startpos.y + pixelHeight);
            
            spanPos.textContent = getPixelCount() + " pixel(s) selected!";
            spanPixel.textContent = "Click to mint this pixel!"
        }
    }

    function render() {
        clearCanvas();
        drawGrid();
        drawImage();
        window.requestAnimationFrame(render);
    }
    window.requestAnimationFrame(render);

    canvas.addEventListener('mousemove', recordMouseMovement);
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);

    function recordMouseMovement(event) {
        mouse = getMousePos(event);
        if(flag != 2) {
            var left  = event.clientX + 5  + "px";
            var top  = event.clientY + 5 + "px";

            div.style.left = left;
            div.style.top = top;

            div.style.display = 'block';
            spanPos.textContent = '( ' + mouse.x / 8 + ', ' + mouse.y / 8 + ' )';
            spanPixel.textContent = "Click to mint this pixel!"
        }        
    }

    function startDrawing(event) {
        divMint.style.display = 'none';
        flag = 1;
        startpos = mouse;
    }

    function check(x1, y1, rect) {
        if(x1 > rect.x  && x1 < (rect.x + rect.width) && y1 > rect.y  && y1 < (rect.y + rect.height))
            return true;
        else
            return false;
    }
    
    function rectIntersection() {
        var current = rectPos(startpos, endpos);

        for(var i = 0; i < gifCount; i ++) {
            var A = {x1: current.x, y1: current.y, x2: current.x + current.width, y2: current.y + current.height};
            var B = {x1: gifPos[i].x, y1: gifPos[i].y, x2: gifPos[i].x + gifPos[i].width, y2: gifPos[i].y + gifPos[i].height};
            if (Rectangles.intersect(A, B)) {
                return {result:gifPos[i].width * gifPos[i].height / 8 / 8, x: gifPos[i].x, y: gifPos[i].y};
            }
        }        
        for(var i = 0; i < imgCount; i ++) {
            var A = {x1: current.x, y1: current.y, x2: current.x + current.width, y2: current.y + current.height};
            var B = {x1: imgPos[i].x, y1: imgPos[i].y, x2: imgPos[i].x + imgPos[i].width, y2: imgPos[i].y + imgPos[i].height};
            if (Rectangles.intersect(A, B)) {
                return {result:imgPos[i].width * imgPos[i].height / 8 / 8, x: imgPos[i].x, y: imgPos[i].y};
            }
        }
        return {result:-1};
    }

    function stopDrawing(event) {
        endpos = mouse;

        var left  = event.clientX + 5  + "px";
        var top  = event.clientY + 5 + "px";

        divMint.style.left = left;
        divMint.style.top = top;

        divMint.style.display = 'block';
        spanCount.textContent = getPixelCount() + " pixel(s) selected!";
        var labelMint = document.getElementById('labelMint');

        var intersect = rectIntersection();
        if(intersect.result != -1) {
            if(getPixelCount() == 1) {
                spanCount.innerHTML = intersect.result + " pixels selected! " + "<br>" + "(" + intersect.x + ", "+ intersect.y + ")";
            }

            labelMint.style.display = 'none';
        }
        else {
            labelMint.style.display = 'inline-block';
        }
        div.style.display = 'none';

        flag = 2;
    }

    function rectPos(start, end) {
        var x = start.x < end.x ? start.x : end.x;
        var y = start.y < end.y ? start.y : end.y;
        var w = start.x - end.x;
        w = w > 0 ? w : ( 0 - w );
        w += pixelWidth;
        var h = start.y - end.y;
        h = h > 0 ? h : ( 0 - h );
        h += pixelHeight;
        return {x: x, y: y, width: w, height: h};
    }

    function onFileChosen(e) {
        const reader = new FileReader();
        const file = buttonMint.files[0];
        reader.onload = handleReaderLoad;
        reader.readAsDataURL(file);

        function handleReaderLoad(e) {
            var filePayload = e.target.result;
            imageflag = 1;
            
            if(file.type=="image/gif") {
                const temp = gifCount;
                setTimeout(() => {
                    myGif[temp] = GIF();
                    myGif[temp].onerror = function (e) {
                        console.log("Gif loading error " + e.type);
                    }
                    myGif[temp].load(filePayload);
    
                }, 0);
                gifPos[gifCount] = rectPos(startpos, endpos);
                console.log("x: ", gifPos[gifCount].x, "y: ", gifPos[gifCount].y, "width: ", gifPos[gifCount].width, "height: ", gifPos[gifCount].height);
                gifCount ++;
            }            
            else {
                myImg[imgCount] = filePayload;
                imgPos[imgCount] = rectPos(startpos, endpos);
                console.log("x: ", imgPos[imgCount].x, "y: ", imgPos[imgCount].y, "width: ", imgPos[imgCount].width, "height: ", imgPos[imgCount].height);
                imgCount ++;
            }
            console.log(filePayload);
            divMint.style.display = 'none';
            flag = 0;
        }
    }
});
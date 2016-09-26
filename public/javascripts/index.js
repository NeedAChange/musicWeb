function $(s) {
    return document.querySelectorAll(s);
}
var size = 64;


var container = $('#container')[0];
var width, heigth;
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
container.appendChild(canvas);

var Dots = [];
var line;

var list = $('#list li');
var mv = new MusicVisulizer({
    size: size,
    visualizer: draw,

});
for (var i = 0; i < list.length; i++) {
    list[i].onclick = function() {
        for (var j = 0; j < list.length; j++) {
            list[j].className = '';
        }
        this.className = 'selected';
        // load("/media/" + this.title);
        mv.play("/media/" + this.title);
    }
}


function random(m, n) {
    return Math.round(Math.random() * (n - m) + m);
}

function getDots() {
    Dots = [];
    for (var i = 0; i < size; i++) {
        var x = random(0, width);
        var y = random(0, height);
        var color = "rgba(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) + ",0";
        Dots.push({
            x: x,
            y: y,
            dx: random(1, 4),
            color: color,
            cap: 0
        });
    }
}



function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
    line = ctx.createLinearGradient(0, 0, 0, height);
    line.addColorStop(0, '#F4A7B9');
    line.addColorStop(0.5, '#F17C67');
    line.addColorStop(1, '#00AA90');
    getDots();
}
resize();
window.onresize = resize;

function draw(arr) {
    ctx.clearRect(0, 0, width, height);
    var w = width / size;
    var cw = w * 0.6;
    var capH = cw > 10 ? 10 : cw;
    ctx.fillStyle = line;
    for (var i = 0; i < size; i++) {
        var o = Dots[i];
        if (draw.type == 'column') {
            var h = arr[i] / 256 * height - 50;
            ctx.fillRect(w * i, height - h, cw, h);
            ctx.fillRect(w * i, height - (o.cap + capH), cw, capH);
            o.cap--;
            if (o.cap < 0) { o.cap = 0 }
            if (h > 0 && o.cap < h + 40) { o.cap = h + 40 > height - capH ? height - capH : h + 40 }
        } else if (draw.type == "dot") {
            ctx.beginPath();
            var r = 10 + arr[i] / 256 * (height > width ? width : height) / 10;
            ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
            var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
            g.addColorStop(0, "#fff");
            g.addColorStop(1, o.color);
            ctx.fillStyle = g;
            ctx.fill();
            o.x += o.dx;
            o.x = o.x > width ? 0 : o.x;
        }
    }
}
draw.type = "column";

$("#volume")[0].onchange = function() {
    mv.changeVolume(this.value / this.max);
}
$("#volume")[0].onchange();

var types = $("#type li");
for (var i = 0; i < types.length; i++) {
    types[i].onclick = function() {
        for (var j = 0; j < types.length; j++) {
            types[j].className = '';
        }
        this.className = "selected";
        draw.type = this.getAttribute("data-type");
    }
}

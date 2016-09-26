function MusicVisulizer(obj) {
    this.source = null;
    this.count = 0;
    this.analyser = MusicVisulizer.ac.createAnalyser();
    this.size = obj.size;
    this.analyser.fftSize = this.size * 2;
    this.gainNode = MusicVisulizer.ac[MusicVisulizer.ac.createGain ? "createGain" : "createGainNode"]();
    this.gainNode.connect(MusicVisulizer.ac.destination);
    this.analyser.connect(this.gainNode);
    this.xhr = new XMLHttpRequest();
    this.visualizer = obj.visualizer;
    this.visualize();
}
MusicVisulizer.ac = new(window.AudioContext || window.webkitAudioContext)();

MusicVisulizer.prototype.load = function(url, fun) {
    this.xhr.abort();
    this.xhr.open("GET", url);
    this.xhr.responseType = "arraybuffer";
    var self = this;
    this.xhr.onload = function() {
        fun(self.xhr.response);
    }
    this.xhr.send();
}
MusicVisulizer.prototype.decode = function(arraybuffer, fun) {
    MusicVisulizer.ac.decodeAudioData(arraybuffer, function(buffer) {
        fun(buffer);
    }, function(err) {
        console.log(err);
    });
}


MusicVisulizer.prototype.play = function(url) {
    var n = ++this.count;
    var self = this;
    this.source && this.stop();
    this.load(url, function(arraybuffer) {
        if (n != self.count) return;
        self.decode(arraybuffer, function(buffer) {
            if (n != self.count) return;
            var bs = MusicVisulizer.ac.createBufferSource();
            bs.connect(self.analyser);
            bs.buffer = buffer;
            bs[bs.start ? "start" : "nodeOn"](0);
            self.source = bs;
        })
    });
}

MusicVisulizer.prototype.stop = function() {
    this.source[this.source.stop ? "stop" : "nodeOff"](0);
}
MusicVisulizer.prototype.changeVolume = function(percent) {
    this.gainNode.gain.value = percent * percent;
}
MusicVisulizer.prototype.visualize = function() {
    var arr = new Uint8Array(this.analyser.frequencyBinCount);
    requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;
    var self = this;

    function v() {
        self.analyser.getByteFrequencyData(arr);
        self.visualizer(arr);
        requestAnimationFrame(v);
    }
    requestAnimationFrame(v);
}

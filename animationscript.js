//Initialize Variables

var canvas = document.getElementById("maincan");
var context = new AudioContext();
var ctx = canvas.getContext("2d");
var oscillator, gain;
var keyAllowed = {};
var ballarray = [];

//Synth Class

var Synth = function (context){
	this.context = context;
	this.numSaws = 3;
	this.detune = 12;
	this.voices = [];
	this.output = this.context.createGain();
}

Synth.prototype.noteOn = function(note, time){
	if(this.voices[note] != null){
		return;
	}
	if (time == null){
		time = this.context.currentTime;
	}
	var freq = noteToFrequency(note);
	var voice = new Voice(this.context, freq, this.numSaws, this.detune);
	voice.connect(this.output);
	voice.start(time);
	this.voices[note] = voice;
	return;
};

Synth.prototype.noteOff = function(note, time){
	if(this.voices[note] == null){
		
		return;
	}
	if (time == null){
		time = this.context.currentTime;
	}

	this.voices[note].stop(time);
	delete this.voices[note];
	return;

};

Synth.prototype.connect = function(target){
	return this.output.connect(target);
}

//Voice Class

var Voice = function(context, frequency, numSaws, detune){
	this.context = context;
	this.frequency = frequency;
	this.numSaws = numSaws;
	this.detune = detune;
	this.output = this.context.createGain();
	this.maxGain = 1/this.numSaws;
	this.attack = 0.001;
	this.decay = 0.015;
	this.release = 0.4;
	this.saws = [];

	for(var i=0; i<numSaws; i++){
		var saw = this.context.createOscillator();
		saw.type = 'sawtooth';
		saw.frequency.value = this.frequency;
		saw.detune.value = -this.detune + i * 2 * this.detune / (this.numSaws - 1);
		saw.start(this.context.currentTime);
		saw.connect(this.output);
		this.saws.push(saw);
	}
}

Voice.prototype.start = function(time){
	this.output.gain.value = 0;
	this.output.gain.setValueAtTime(0, time);
	return this.output.gain.setTargetAtTime(this.maxGain, time + this.attack, this.decay + 0.001);
};

Voice.prototype.stop = function(time){
	var _this = this; 
	this.output.gain.cancelScheduledValues(time);
	this.output.gain.setValueAtTime(this.output.gain.value, time);
	this.output.gain.setTargetAtTime(0, time, this.release/10);
	this.saws.forEach(function(saw){
		saw.stop(time + _this.release);
	});
	return;
};

Voice.prototype.connect = function(target){
	return this.output.connect(target);
};

function noteToFrequency(note){
	return Math.pow(2, (note-69)/12) * 440.0;
}

function startOsc(frequency){
	oscillator = context.createOscillator();
	oscillator.type = 0;
	oscillator.frequency.value = frequency;
	oscillator.start(0);

	oscillator.connect(context.destination);
}

function off(){
	oscillator.stop(0);
	oscillator.disconnect();
}

var synth = new Synth(context);
synth.connect(context.destination);

//Vector Class

function Vector(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

Vector.prototype.lengthof = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.add = function(a, b) {
	return new Vector(a.x + b.x, a.y + b.y);
};

Vector.sub = function(a, b) {
	return new Vector(a.x - b.x, a.y - b.y);
};

Vector.scale = function(v, s) {
	return new Vector(v.x * s, v.y *s);
};

Vector.random = function() {
	return new Vector(
		Math.random() * 2 - 1,
		Math.random() * 2 - 1
		);
};

Vector.distancebetween = function(v,s) {
	var dx = v.x - s.x,
	dy = v.y - s.y;
	return Math.sqrt(dx * dx + dy * dy);
};

Vector.bounceoff = function(start,finish){
	var dx = finish.x - start.x,
	dy = finish.y - start.y;
	var length = Math.sqrt(dx * dx + dy * dy)
	return new Vector(dx/length,dy/length);
};

//StaticBall Class

function StaticBall(x,y,r) {
	this.x = x || 0;
	this.y = y || 0;
	this.r = r || 0;
	this.v = new Vector(x,y);
};

StaticBall.prototype.draw = function(ctx){
	ctx.beginPath();
	grd2 = ctx.createRadialGradient(this.x + this.r, this.y + this.r, 0, this.x + this.r, this.y + this.r, this.r *3.2);
	grd2.addColorStop(1, 'rgba(10, 10, 255, 1)');
	grd2.addColorStop(0, 'rgba(150, 150, 255, 1)');
	ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
	ctx.fillStyle = grd2;
	ctx.fill();
};

StaticBall.prototype.displace = function(x,y){
	this.x = this.x + x;
	this.y = this.y + y;
};

//Input Definitions

document.onkeydown = function(e) {
	// if (keyAllowed[e.keyCode] === false) return;
	// keyAllowed[e.keyCode] = false;
	switch (e.keyCode){
		case 65:
			//startOsc(261.63);
			synth.noteOn(60);
			break;
			case 83:
			//startOsc(392.00);
			synth.noteOn(62);
			break;
			case 68:
			//startOsc(261.63);
			synth.noteOn(64);
			break;
		case 70:
			//startOsc(392.00);
			synth.noteOn(65);
			break;
		case 74:
			//startOsc(261.63);
			synth.noteOn(67);
			break;
		case 75:
			//startOsc(261.63);
			synth.noteOn(69);
			break;
		case 76:
			//startOsc(392.00);
			synth.noteOn(71);
			break;
		case 186:
			//startOsc(392.00);
			synth.noteOn(72);
			break;
	}
}

document.onkeyup = function(e) {
	//keyAllowed[e.keyCode] = true;
	switch(e.keyCode){
		case 65:
			//startOsc(261.63);
			synth.noteOff(60);
			break;
		case 83:
			//startOsc(392.00);
			synth.noteOff(62);
			break;
		case 68:
			//startOsc(261.63);
			synth.noteOff(64);
			break;
		case 70:
			//startOsc(392.00);
			synth.noteOff(65);
			break;
		case 74:
			//startOsc(261.63);
			synth.noteOff(67);
			break;
		case 75:
			//startOsc(261.63);
			synth.noteOff(69);
			break;
		case 76:
			//startOsc(392.00);
			synth.noteOff(71);
			break;
		case 186:
			//startOsc(392.00);
			synth.noteOff(72);
			break;

	}
}

//Main function

(function() {
	var canvas = document.getElementById("maincan");
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	var toppos = new Vector(125 + Math.random() * 275, 50);
	var topR = 50;

	ctx.beginPath();
	grd1 = ctx.createRadialGradient(toppos.x + topR, toppos.y + topR, 0, toppos.x + topR, toppos.y + topR, topR *3.2);
	grd1.addColorStop(1, 'rgba(255, 10, 10, 1)');
	grd1.addColorStop(0, 'rgba(255, 150, 150, 1)');
	ctx.arc(toppos.x, toppos.y, topR, 0, Math.PI * 2, false);
	ctx.fillStyle = grd1;
	ctx.fill();

	ballarray[0] = new StaticBall(300,600,150);
	ballarray[1] = new StaticBall(550,800,50);
	ballarray[2] = new StaticBall(950,700,200);
	ballarray[3] = new StaticBall(1250,400,100);
	ballarray[4] = new StaticBall(150,300,100);

	ballarray.forEach(function(e,i,a){
		e.draw(ctx);
	});

	var topstart = new Vector(0,0);
	var grav = new Vector(0,0.1);
	
	function animate() {

		synth.noteOff(62);

		RequestID = requestAnimationFrame(animate);

		ctx.clearRect(toppos.x - topR - 5, toppos.y - topR - 5, topR * 3, topR * 3);

		toppos.x = toppos.x + topstart.x;
		toppos.y = toppos.y + topstart.y;

		ballarray.forEach(function(e,i,a){
			if (Vector.distancebetween(e.v,toppos) < (topR+e.r)){
				synth.noteOn(62);
				var length = topstart.lengthof();
				topstart = Vector.bounceoff(e.v,toppos);
				topstart = Vector.scale(topstart, length/1.2);
			}
			else{
				topstart = Vector.add(topstart, grav);
			}
		});

		ctx.beginPath();
		grd1 = ctx.createRadialGradient(toppos.x + topR, toppos.y + topR, 0, toppos.x + topR, toppos.y + topR, topR *3.2);
		grd1.addColorStop(1, 'rgba(255, 10, 10, 1)');
		grd1.addColorStop(0, 'rgba(255, 150, 150, 1)');
		ctx.arc(toppos.x, toppos.y, topR, 0, Math.PI * 2, false);
		ctx.fillStyle = grd1;
		ctx.fill();

		ballarray.forEach(function(e,i,a){
			e.draw(ctx);
		});

	}

	requestAnimationFrame(animate);

}());
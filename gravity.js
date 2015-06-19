//Initialize Variables

var canvas = document.getElementById("maincan");
var context = new AudioContext();
var ctx = canvas.getContext("2d");
var oscillator, gain;
var keyAllowed = {};
var asteroids = [];
var planets = [];
var rings = [];

//Synth Class

var Synth = function (context){
	this.context = context;
	this.numSaws = 2;
	this.detune = 20;
	this.voices = [];
	this.output = this.context.createGain();
}

Synth.prototype.noteHit = function(note, time){
	if (time == null){
		time = this.context.currentTime;
	}

	var freq = noteToFrequency(note);
	var voice = new Voice(this.context, freq, this.numSaws, this.detune);
	voice.connect(this.output);
	voice.start(time);
	voice.stop(time + 0.3);
	return;
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
	this.attack = 0.005;
	this.decay = 0.01;
	this.release = 0.6;
	this.saws = [];

	for(var i=1; i<numSaws+1; i++){
		var saw = this.context.createOscillator();
		saw.type = 'sine';
		saw.frequency.value = this.frequency * i;
		var amplitude = this.context.createGain();
		amplitude.gain.value = +(1/i.toFixed(3));

		saw.connect(amplitude);
		amplitude.connect(this.output);
		saw.start(this.context.currentTime);
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

var SlapbackNode = function() {
	this.input = context.createGain();
	var output = context.createGain();
	var delay = context.createDelay();
	var feedback = context.createGain();
	var wetLevel = context.createGain();

	delay.delayTime.value = 0.25;
	feedback.gain.value = 0.25;
	wetLevel.gain.value = 0.25;

	this.input.connect(delay);
	this.input.connect(output);
	delay.connect(feedback);
	delay.connect(wetLevel);
	feedback.connect(delay);
	wetLevel.connect(output);

	this.connect = function(target){
		output.connect(target);
	}
}

var synth = new Synth(context);
var slap = new SlapbackNode();
 synth.connect(slap.input);
 slap.connect(context.destination);

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
	var dx = v.x - s.x;
	var dy = v.y - s.y;
	return Math.sqrt(dx * dx + dy * dy);
};

Vector.normalize = function(v){
	return new Vector(v.x/v.lengthof(),v.y/v.lengthof());
};

function Asteroid(x,y,r,dx,dy) {
	this.v = new Vector(x,y);
	this.dv = new Vector(dx,dy);
	this.r = r || 0;

};

Asteroid.prototype.draw = function(ctx){
	ctx.beginPath();
	grd1 = ctx.createRadialGradient(this.v.x + this.r, this.v.y + this.r, 0, this.v.x + this.r, this.v.y + this.r, this.r *3.2);
	grd1.addColorStop(1, 'rgba(255, 10, 10, 1)');
	grd1.addColorStop(0, 'rgba(255, 150, 150, 1)');
	ctx.arc(this.v.x, this.v.y, this.r, 0, Math.PI * 2, false);
	ctx.fillStyle = grd1;
	ctx.fill();
};

Asteroid.prototype.displace = function(x,y){
	this.v.x = this.v.x + x;
	this.v.y = this.v.y + y;
};

Asteroid.prototype.update = function(){
	this.v.x = this.v.x + this.dv.x;
	this.v.y = this.v.y + this.dv.y;
};

function Planet(x,y,r,dx,dy) {
	this.v = new Vector(x,y);
	this.r = r || 0;
	this.collided = 0;

};

Planet.prototype.draw = function(ctx){
	ctx.beginPath();
	grd2 = ctx.createRadialGradient(this.v.x + this.r, this.v.y + this.r, 0, this.v.x + this.r, this.v.y + this.r, this.r *3.2);
	grd2.addColorStop(1, 'rgba(255, 10, 10, 1)');
	grd2.addColorStop(0, 'rgba(255, 150, 150, 1)');
	ctx.arc(this.v.x, this.v.y, this.r, 0, Math.PI * 2, false);
	ctx.fillStyle = grd2;
	ctx.fill();
};

(function() {

	document.onmousedown = function(e){
		asteroids.push(new Asteroid(e.x,e.y,10,4,0));
	}

	var canvas = document.getElementById("maincan");
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	planets.push(new Planet(400,400,200));

	function animate() {

		ctx.clearRect(0,0,canvas.width,canvas.height);

		RequestID = requestAnimationFrame(animate);

		planets.forEach(function(e,i,a){
			e.draw(ctx);
		});

		asteroids.forEach(function(ea,ia,aa){
			planets.forEach(function(ep,ip,ap){
				gravdir = Vector.normalize(Vector.sub(ep.v,ea.v));
				distance = Vector.distancebetween(ea.v,ep.v);
				force = Vector.scale(gravdir, 4000/(distance*distance));
				ea.dv = Vector.add(ea.dv,force);
			});
			ea.update();
			ea.draw(ctx);
		});

	}

	requestAnimationFrame(animate);

}());
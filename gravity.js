//Synth Class

var Synth = function (context){
	this.context = context;
	this.numSaws = 8;
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
	this.attack = 0.001;
	this.decay = 0.005;
	this.release = 0.6;
	this.saws = [];

	for(var i=0; i<numSaws; i++){
		var saw = this.context.createOscillator();
		// if (i == 5) {saw.type = 'sawtooth';}
		// else {saw.type = 'sine';}
		saw.type = 'sine';
		saw.frequency.value = this.frequency;
		saw.detune.value = -this.detune + i * 2 * this.detune / (this.numSaws - 1);
		
		saw.connect(this.output);
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

// function startOsc(frequency){
// 	oscillator = context.createOscillator();
// 	oscillator.type = 0;
// 	oscillator.frequency.value = frequency;
// 	oscillator.start(0);

// 	oscillator.connect(context.destination);
// }

// function off(){
// 	oscillator.stop(0);
// 	oscillator.disconnect();
// }

var SlapbackNode = function() {
	this.input = context.createGain();
	var output = context.createGain();
	var delay = context.createDelay();
	var feedback = context.createGain();
	var wetLevel = context.createGain();

	delay.delayTime.value = 0.15;
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
//synth.connect(context.destination);
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
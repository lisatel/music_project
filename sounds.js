var context = new AudioContext();


var oscillator, gain;
var keyAllowed = {};

//Synth class
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
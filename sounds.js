var context = new AudioContext();
var oscillator, gain;
var keyAllowed = {};

//Synth class
function Synth(context){
	this.context = context;
	this.numSaws = 5;
	this.detune = 12;
	this.voices = [];
	this.output = this.context.createGain();
};

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
function Voice(context, frequency, numSaws, detune){
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
		saw.type = 'square';
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

//Kick Class

function Kick(context){
	this.context = context;
};

Kick.prototype.setup = function(){
	this.osc = this.context.createOscillator();
	this.oscEnvelope = this.context.createGain();
	this.osc.connect(this.oscEnvelope);
	this.oscEnvelope.connect(this.context.destination);
};

Kick.prototype.trigger = function(time){
	this.setup();
	this.osc.frequency.setValueAtTime(150, time);
	this.oscEnvelope.gain.setValueAtTime(1, time);

	this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
	this.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

	this.osc.start(time);
	this.osc.stop(time + 0.5);
};

//Snare Class
function Snare(context){
	this.context = context;
};

Snare.prototype.noiseBuffer = function(){
	var bufferSize = this.context.sampleRate;
	var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);

	var output = buffer.getChannelData(0);
	for(var i=0; i<bufferSize; i++){
		output[i] = Math.random() * 2 - 1;
	}

	return buffer;

};

Snare.prototype.setup = function(){
	this.noise = this.context.createBufferSource();
	this.noise.buffer = this.noiseBuffer();
	var noiseFilter = this.context.createBiquadFilter();
	noiseFilter.type = 'highpass';
	noiseFilter.frequency.value = 1000;
	this.noise.connect(noiseFilter);

	this.noiseEnvelope = this.context.createGain();
	noiseFilter.connect(this.noiseEnvelope);
	this.noiseEnvelope.connect(this.context.destination);

	this.osc = this.context.createOscillator();
	this.osc.type = 'triangle';
	this.oscEnvelope = this.context.createGain();
	this.osc.connect(this.oscEnvelope);
	this.oscEnvelope.connect(this.context.destination);
}

Snare.prototype.trigger = function(time){
	this.setup();

	this.noiseEnvelope.gain.setValueAtTime(1, time);
	this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time+0.2);
	this.noise.start(time);

	this.osc.frequency.setValueAtTime(100, time);
	this.oscEnvelope.gain.setValueAtTime(0.7, time);
	this.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time+0.1);
	this.osc.start(time);

	this.osc.stop(time+0.2);
	this.noise.stop(time + 0.2);
}



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

var kick = new Kick(context);
// var now = context.currentTime;
var snare = new Snare(context);

// for(var i=0; i<5; i++){
// 	kick.trigger(now + (0.5*i));
// 	snare.trigger(now + i);
// }


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

var drumMachine = {
	"tempo": 50,
	"kickRhythm": [0,0,0,0,0,0,0,0,0,0,0,0],
	"snareRhythm": [0,0,0,0,0,0,0,0,0,0,0,0]
};

var drums = ["kick", "snare"];
var startTime;
var noteTime;
var rhythmCount = 0;
var loopLength = 12;
var timeout;
var playing;

function handleClick(element){
	var rhythm;

	var id = element.getAttribute("id");
	var strArr = id.split('_');
	var drum = strArr[0];
	var rhythmIndex = strArr[1];

	var drumIndex = drums.indexOf(drum);

	switch(drumIndex){
		case 0:
			rhythm = drumMachine.kickRhythm;
			break;
		case 1:
			rhythm = drumMachine.snareRhythm;
			break;
	}

	rhythm[rhythmIndex] = (rhythm[rhythmIndex] + 1) % 2;

	if (element.getAttribute("class") == "off"){
		element.setAttribute("class", "on");
		now = context.currentTime;
		switch(drum){
			case "kick": 
				kick.trigger(now);
				break;
			case "snare":
				snare.trigger(now);
		}

	} else{
		element.setAttribute("class", "off");
	}
	
}

function handlePlay(){
	noteTime = 0.0;
	startTime = context.currentTime + 0.005;
	playing = true;
	goDrumsGo();
}

function goDrumsGo(){
	var now = context.currentTime;

	now -= startTime;

	 while (noteTime < now + 0.2) {
	 	//console.log("noteTime is " + noteTime);
	 	//console.log("now is " + now);
		var playTime = noteTime + startTime;
		
		if(drumMachine.kickRhythm[rhythmCount]) { kick.trigger(playTime); }

		if(drumMachine.snareRhythm[rhythmCount]) { snare.trigger(playTime); }

		advance();

		}
		//console.log("out of while");
		timeout = setTimeout("goDrumsGo()", 0);


}

function advance(){
	var secondsPerBeat = 60/drumMachine.tempo;

	rhythmCount++;
	if(rhythmCount == loopLength){
		rhythmCount = 0;
	}

	noteTime += 0.25*secondsPerBeat;
}

function handleStop(){
	console.log("stop");
	clearTimeout(timeout);
	rhythmCount = 0;
}
// var c = document.getElementById("maincan");
// var ctx = c.getContext("2d");
// for (var i=0; i<10; i++){
// 	ctx.beginPath();
// 	ctx.arc(100 + (i*25),75,10,0,2*Math.PI);
// 	ctx.stroke();
// }
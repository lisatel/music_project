//Initialize Variables

var canvas = document.getElementById("maincan");
var context = new AudioContext();
var ctx = canvas.getContext("2d");
var oscillator, gain;
var keyAllowed = {};
var ballarray = [];
var fballarray = [];
var fballcounter = 5;
var growflag = 0;
var growstep = 0;
var growpoint = new Vector(0,0);

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
	this.decay = 0.005;
	this.release = 0.6;
	this.saws = [];

	for(var i=0; i<numSaws; i++){
		var saw = this.context.createOscillator();
		saw.type = 'sine';
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
	var dx = v.x - s.x;
	var dy = v.y - s.y;
	return Math.sqrt(dx * dx + dy * dy);
};

Vector.bounceoff = function(start,finish){
	var dx = finish.x - start.x;
	var dy = finish.y - start.y;
	var length = Math.sqrt(dx * dx + dy * dy)
	return new Vector(dx/length,dy/length);
};

//StaticBall Class

function StaticBall(x,y,r,note) {
	this.x = x || 0;
	this.y = y || 0;
	this.r = r || 0;
	this.v = new Vector(x,y);
	this.note = note;
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

//FallingBall Class

function FallingBall(x,y,r,dx,dy,note) {
	this.v = new Vector(x,y);
	this.dv = new Vector(dx,dy);
	this.r = r || 0;
	this.note = note;
	this.collided = 0;

};

FallingBall.prototype.draw = function(ctx){
	ctx.beginPath();
	grd1 = ctx.createRadialGradient(this.v.x + this.r, this.v.y + this.r, 0, this.v.x + this.r, this.v.y + this.r, this.r *3.2);
	grd1.addColorStop(1, 'rgba(255, 10, 10, 1)');
	grd1.addColorStop(0, 'rgba(255, 150, 150, 1)');
	ctx.arc(this.v.x, this.v.y, this.r, 0, Math.PI * 2, false);
	ctx.fillStyle = grd1;
	ctx.fill();
};

FallingBall.prototype.displace = function(x,y){
	this.v.x = this.v.x + x;
	this.v.y = this.v.y + y;
};

FallingBall.prototype.update = function(){
	this.v.x = this.v.x + this.dv.x;
	this.v.y = this.v.y + this.dv.y;
};

//Main function

(function() {

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

	document.onmousedown = function(e){
				if (e.y < 200){
					fballarray[fballcounter] = new FallingBall(e.x ,e.y-25,25,0,0,65);
					fballcounter = fballcounter + 1;	
				}
				else {
				growstep = 0;
				growpoint.x = e.x;
				growpoint.y = e.y-25;
				growflag = 1;
			}

	}

	document.onmouseup = function(e){
		if (growpoint.y >= 150 && growpoint.y != 0){
		growflag = 0;
		note = Math.max(72 - Math.floor(growstep/25),60)
		ballarray.push(new StaticBall(growpoint.x,growpoint.y,growstep,note));
		growstep = 0;
		growpoint.y = 0;
		}

	}

	var canvas = document.getElementById("maincan");
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	//fballarray[0] = new FallingBall(125+Math.random()*275,50,50,0,0);
	//fballarray[1] = new FallingBall(325+Math.random()*275,50,50,0,0);
	//fballarray[2] = new FallingBall(425+Math.random()*275,50,50,0,0);
	//fballarray[3] = new FallingBall(625+Math.random()*275,50,50,0,0);

	fballarray.forEach(function(e,i,a){
		e.draw(ctx);
	});

	//ballarray[0] = new StaticBall(300,600,150);
	//ballarray[1] = new StaticBall(550,800,50);
	//ballarray[2] = new StaticBall(950,700,200);
	//ballarray[3] = new StaticBall(1250,400,100);
	//ballarray[4] = new StaticBall(150,300,100);

	ballarray.forEach(function(e,i,a){
		e.draw(ctx);
	});

	var grav = new Vector(0,0.1);
	
	function animate() {

		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = 'rgba(255, 10, 10, 0.1)';
		ctx.fillRect(0,0,ctx.canvas.width,170);

		synth.noteOff(60);
		synth.noteOff(61);
		synth.noteOff(62);
		synth.noteOff(63);
		synth.noteOff(64);
		synth.noteOff(65);
		synth.noteOff(66);
		synth.noteOff(67);
		synth.noteOff(68);
		synth.noteOff(69);
		synth.noteOff(70);
		synth.noteOff(71);
		synth.noteOff(72);
		growstep = growstep + 1;

		RequestID = requestAnimationFrame(animate);

		fballarray.forEach(function(e,i,a){

			e.update();
			collidedupdate = 0;

			ballarray.forEach(function(ea,ia,aa){
				if (Vector.distancebetween(ea.v,e.v) < (ea.r+e.r)-1){
					//synth.noteOn(ea.note);
					var length = e.dv.lengthof();
					if (e.collided < 3 && collidedupdate == 0 && (Vector.distancebetween(ea.v,e.v) > (ea.r+e.r)-10)){
						e.dv = Vector.bounceoff(ea.v,e.v);
						if (Math.abs(e.dv.x) < .0001){
							e.dv.x = .01;
						}
						e.dv = Vector.scale(e.dv, length/1.2);
						collidedupdate = 1;
						synth.noteOn(ea.note);
					}
					else{
						a.splice(i,1);
					}
				}
				else{
					e.collided = 0;
				}
			});
			if (e.collided == 0){
				e.dv = Vector.add(e.dv, grav);
			}
			e.collided = e.collided + collidedupdate;
			collidedupdate = 0;
		});

		fballarray.forEach(function(e,i,a){
		e.draw(ctx);
		});

		ballarray.forEach(function(e,i,a){
			e.draw(ctx);
		});

		if (growflag == 1){
			ctx.beginPath();
			grd2 = ctx.createRadialGradient(growpoint.x + growstep, growpoint.y + growstep, 0, growpoint.x + growstep, growpoint.y + growstep, growstep *3.2);
			grd2.addColorStop(1, 'rgba(10, 10, 255, 1)');
			grd2.addColorStop(0, 'rgba(150, 150, 255, 1)');
			ctx.arc(growpoint.x, growpoint.y, growstep, 0, Math.PI * 2, false);
			ctx.fillStyle = grd2;
			ctx.fill();
		}

	}

	requestAnimationFrame(animate);

}());
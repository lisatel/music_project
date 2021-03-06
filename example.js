//Vector Class

function Vector(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

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

//StaticBall

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

var ballarray = [];

document.onkeydown = function(e) {
	// if (keyAllowed[e.keyCode] === false) return;
	// keyAllowed[e.keyCode] = false;
	switch (e.keyCode){
		case 65:
		console.log("stuff");
		ballarray[6] = new StaticBall(10,600,150);
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

	(function() {
		var canvas = document.getElementById("maincan");
		if (canvas.getContext) {
			var ctx = canvas.getContext("2d");
			ctx.canvas.width  = window.innerWidth;
			ctx.canvas.height = window.innerHeight;

			var toppos = new Vector(125 + Math.random() * 275, 50);
			var topR = 50;

			var botpos = new Vector(300, 600);
			var botR = 150;

			ctx.beginPath();
			grd1 = ctx.createRadialGradient(toppos.x + topR, toppos.y + topR, 0, toppos.x + topR, toppos.y + topR, topR *3.2);
			grd1.addColorStop(1, 'rgba(255, 10, 10, 1)');
			grd1.addColorStop(0, 'rgba(255, 150, 150, 1)');
			ctx.arc(toppos.x, toppos.y, topR, 0, Math.PI * 2, false);
			ctx.fillStyle = grd1;
			ctx.fill();

			var ballarray = [];

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
		}


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
//Vector

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

		ball1 = new StaticBall(botpos.x,botpos.y,botR);
		ball1.draw(ctx);


		var topstart = new Vector(0,0);
		var botstart = new Vector(0,0);
		var grav = new Vector(0,0.1);
		//var synth = new Synth(ctx);
	}


	function animate() {

	synth.noteOff(62);

	RequestID = requestAnimationFrame(animate);

    ctx.clearRect(toppos.x - topR - 5, toppos.y - topR - 5, topR * 3, topR * 3);
    ctx.clearRect(botpos.x - ball1.r - 5, botpos.y - ball1.r - 5, ball1.r * 3, ball1.r * 3);


    toppos.x = toppos.x + topstart.x;
    toppos.y = toppos.y + topstart.y;
    ball1.displace(botstart.x,botstart.y);
    botpos = new Vector (ball1.x,ball1.y);

    if (Vector.distancebetween(botpos,toppos) < (topR+ball1.r)){
    	synth.noteOn(62);
    	var length = topstart.lengthof();
    	topstart = Vector.bounceoff(botpos,toppos);
    	topstart = Vector.scale(topstart, length/1.2);
    }
    else{
    	topstart = Vector.add(topstart, grav);
    }

    ctx.beginPath();
  	grd1 = ctx.createRadialGradient(toppos.x + topR, toppos.y + topR, 0, toppos.x + topR, toppos.y + topR, topR *3.2);
	grd1.addColorStop(1, 'rgba(255, 10, 10, 1)');
	grd1.addColorStop(0, 'rgba(255, 150, 150, 1)');
	ctx.arc(toppos.x, toppos.y, topR, 0, Math.PI * 2, false);
	ctx.fillStyle = grd1;
	ctx.fill();

	ball1.draw(ctx);

  }

  requestAnimationFrame(animate);

}());
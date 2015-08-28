EventQueue = function() {
	this._time = 0;
	this._events = [];
}

EventQueue.prototype.getTime = function() {
	return this._time;
}

EventQueue.prototype.clear = function() {
	this._events = [];
	return this;
}

EventQueue.prototype.add = function(event, time) {
	var index = this._events.length;

	this._events.splice(index, 0, event);
}

EventQueue.prototype.get = function() {
	if (!this._events.length) { return null; }

	return this._events.splice(0, 1)[0];
}

EventQueue.prototype.remove = function(event) {
	var index = this._events.indexOf(event);
	if (index == -1) { return false }
	this._remove(index);
	return true;
}

EventQueue.prototype._remove = function(index) {
	this._events.splice(index, 1);
}

Scheduler = function() {
	this._queue = new EventQueue();
	this._repeat = [];
	this._current = null;
}

Scheduler.prototype.getTime = function() {
	return this._queue.getTime();
}

Scheduler.prototype.add = function(item, repeat) {
	this._queue.add(item, 0);
	if (repeat) { this._repeat.push(item); }
	
	return this;
}

Scheduler.prototype.clear = function() {
	this._queue.clear();
	this._repeat = [];
	this._current = null;
	return this;
}

Scheduler.prototype.remove = function(item) {
	var result = this._queue.remove(item);

	var index = this._repeat.indexOf(item);
	if (index != -1) { this._repeat.splice(index, 1); }

	if (this._current == item) { this._current = null; }

	return result;
}

Scheduler.prototype.next = function() {
	if (this._current && this._repeat.indexOf(this._current) != -1) {
		this._queue.add(this._current, 0);
	}
	
	this._current = this._queue.get();
	return this._current;
}

Engine = function(scheduler) {
	this._scheduler = scheduler;
	this._lock = 1;
}

Engine.prototype.start = function() {
	return this.unlock();
}

Engine.prototype.lock = function() {
	this._lock++;
	return this;
}

Engine.prototype.unlock = function() {
	if (!this._lock) { throw new Error("Cannot unlock unlocked engine"); }
	this._lock--;

	while (!this._lock) {
		var actor = this._scheduler.next();
		if (!actor) { return this.lock(); } /* no actors */
		var result = actor.act();
		if (result && result.then) { /* actor returned a "thenable", looks like a Promise */
			this.lock();
			result.then(this.unlock.bind(this));
		}
	}

	return this;
}

Actor = function(){
}

Actor.prototype.act = function(){
	engine.lock();
	window.addEventListener("keydown", this);
}

Actor.prototype.handleEvent = function(e) {
	console.log('Actor');
	if (e.keyCode == '38') {
       sprites[1].y-=1;
    }
    else if (e.keyCode == '40') {
       sprites[1].y+=1;
    }
    else if (e.keyCode == '37') {
       sprites[1].x-=1;
    }
    else if (e.keyCode == '39') {
       sprites[1].x+=1;
    }
	
	window.removeEventListener("keydown", this);
	engine.unlock();
}

Enemy = function(id){
	this._id = id;
	this.promise = null;
}
var c = 0;
Enemy.prototype.act = function(){
	var done = null;
	this.promise = {
		pendent : null,
		then: function(cb) { 
			done = cb; 
			sprites[2].x++;
	
			if(c++>3){
				sprites[3].x = sprites[2].x;
				sprites[3].y = sprites[2].y;
				sprites[3].vel = 1;
				objects.push(sprites[3]);
				this.pendent = done;
				c=0;
			}else{
				done();
			}
			
		}
	}
	
	return this.promise;
}

Enemy.prototype.done = function(){
	if(this.promise.pendent != null)
		this.promise.pendent();
}

if (!window.requestAnimationFrame) {

    window.requestAnimationFrame = (function() {

        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame || // comment out if FF4 is slow (it caps framerate at ~30fps: https://bugzilla.mozilla.org/show_bug.cgi?id=630127)
			window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {

                window.setTimeout(callback, 1000 / 60);

        };

    })();

}
var dim = 10;
var objects = [];
var map= [];

for(var i=0;i<dim;i++){
	var row = [];
	for(var j=0;j<dim;j++){
		row.push(0);
	}
	map.push(row);
}

function anim() {
    requestAnimationFrame(anim);
	update();
    draw();
}
var lastD = new Date();
function update(){
	for(var i=0;i<objects.length;i++){
		var sprite = objects[i];
		if(sprite.vel>0){
			var newD = new Date();
			var delta = new Date(newD- lastD);
			
			if(delta.getMilliseconds()>300){
				sprite.x -=sprite.vel;
				sprite.y +=sprite.vel;
				lastD = new Date();
				
				if(sprite.y>4){
					console.log(objects)
					e1.done();
					objects.splice(2,1);
				}
			}
		}
	}
}
function draw() {
    // Put your code here
	//console.log('here')
	ctx.clearRect(0,0,canvas.width, canvas.height);
	
	for(var i=0;i<map.length;i++){
		for(var j=0;j<map[0].length;j++){
			var sprite = sprites[map[i][j]];
			ctx.drawImage(sprite.image, sprite.getFrame()*20, 0, 20, 20, i*20, j*20, 20, 20);
		}
	}
	
	for(var i=0;i<objects.length;i++){
		var sprite = objects[i];
		ctx.drawImage(sprite.image, sprite.getFrame()*20, 0, 20, 20, sprite.x*20, sprite.y*20, 20, 20);
	}
}
	

var sprites = [];

Sprite = function(img, frames,x,y){
	this.image = img;
	this.frames = frames;
	this.frame = 0;
	this.currentSequence = 0;
	this.lastD = new Date();
	
	this.x=x;
	this.y=y;
	this.vel =0;
}

Sprite.prototype.getFrame = function(){
	if(this.frames.length==1)
		this.currentSequence = 0;
	else
	{
		if(this.currentSequence<this.frames.length-1){
			var newD = new Date();
			var delta = new Date(newD- this.lastD);
			
			if(delta.getMilliseconds()>300){
				this.currentSequence++;
				this.lastD = new Date();
			}
		}
		else
			this.currentSequence = 0;
	}
	
	return this.frames[this.currentSequence];
}

var setup = function() {
	

	// Load each image URL from the assets array into the frames array 
	// in the correct order.
	// Afterwards, call setInterval to run at a framerate of 30 frames 
	// per second, calling the animate function each time.
	for(var i=0;i<assets.length;i++)
    {
        frames.push(new Image());
        frames[i].onload = onImageLoad;
        frames[i].src = assets[i];
    }
    setInterval(animate, 1000/30);
};

var animate = function(){
	// Draw each frame in order, looping back around to the 
	// beginning of the animation once you reach the end.
    // Draw each frame at a position of (0,0) on the canvas.
  
    // Try your code with this call to clearRect commented out
    // and uncommented to see what happens!
    //

    
    frame = (frame+1) % frames.length;
};


var engine;

var onImageLoad = function(){
	var s = new Sprite(img, [1]);
	//tile
	sprites.push(s);
	s = new Sprite(img, [0], 1,1);
	//ship
	sprites.push(s);
}

var onImageLoad2 = function(){
	var s = new Sprite(img2, [0,0,1,2,2,2,2,3],0,0);
	var bullet  = new Sprite(img2, [0],0,0);
	//enemy animation
	sprites.push(s);
	sprites.push(bullet);
	
	objects.push(sprites[1]);
	objects.push(sprites[2]);
	anim();
}

var body, canvas, ctx, img, img2;
var e1;

window.onload = function(){

	body = document.getElementsByTagName('body')[0];
	canvas = document.createElement('canvas');
	ctx = canvas.getContext('2d');
	
	canvas.width = map.length*30;
	canvas.height = map[0].length*30;

	body.appendChild(canvas);
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	ctx.scale(2,2);
	var a = new Actor();
 e1 = new Enemy(1);
	var e2 = new Enemy(2);
	
	var s = new Scheduler();
	s.add(a, true);
	s.add(e1, true);
	//s.add(e2, true);
	
	engine = new Engine(s);
	engine.start();
	
	
	img = new Image();
	img.onload = onImageLoad;
	img.src = "images/ship.png";
	
	img2 = new Image();
	img2.onload = onImageLoad2;
	img2.src = "images/enemy.png";
	
}
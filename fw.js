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
	window.removeEventListener("keydown", this);
	engine.unlock();
}

Enemy = function(id){
	this._id = id;
}

Enemy.prototype.act = function(){
	console.log('Enemy' + this._id);
}

var engine;

window.onload = function(){
	var a = new Actor();
	var e1 = new Enemy(1);
	var e2 = new Enemy(2);
	
	var s = new Scheduler();
	s.add(a, true);
	s.add(e1, true);
	s.add(e2, true);
	
	engine = new Engine(s);
	engine.start();
}
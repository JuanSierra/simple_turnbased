## Turn based game framework
[rot.js](http://ondras.github.io/rot.js/hp/) is a library for making roguelikes on js.  I just extracted the "simple scheduler" type (no speed managed)  code to have some extra features on any potential turn based game.
 
## Usage
Add any object implementing an **act()** method to a Scheduler instance. 

```sh
var a = new Actor();
var e1 = new Enemy(1);
var e2 = new Enemy(2);

var s = new Scheduler();
s.add(a, true);
s.add(e1, true);
s.add(e2, true);

engine = new Engine(s);
engine.start();
```

Lock() and Unlock() Engine methods control the game turns.

```sh
Actor.prototype.act = function(){
	//stops act() invocations on all added entities
	engine.lock();
	
	//attach the keyboard listener and wait to a key to be pressed
	window.addEventListener("keydown", this);
}
```sh

## Test
By the moment all interaction could be followed through the browser console.


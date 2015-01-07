/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function randomInt(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
};

/* Phases:
 * DEAD
 * ALIVE
 */

function Land(canvas, width, height) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.things = [];
    this.createLand = function() {
        var x = 0,
            y = 0,
            i = 0,
            w = Math.floor(this.canvas.width / this.width), // Thing width
            h = Math.floor(this.canvas.height / this.height); // Thing height
        for (x = 0; x < this.width; x++) {
            for (y = 0; y < this.height; y++) {
                i = this.width * y + x;
                this.things[i] = new Thing(x, y, w, h,
                                           this.canvas.getContext('2d'));
            }
        }
        this.drawLand();
    };
    this.setThingAliveAt = function(x,y) {
        var thing = this.getThingAt(x,y);
        thing.setAlive();
    };
    this.getThingAt = function(x,y) {
        var index = this.width * y + x;
        return this.things[index];
    };
    this.drawLand = function() {
        var x = 0,
            y = 0,
            i = 0;
    
//        var str = "";
    
        for (y = 0; y < this.height; y++) {
            for (x = 0; x < this.width; x++) {
                i = this.width * y + x;
                this.things[i].drawThing(this.canvas);
                
//                if (this.things[i].isAlive()) {
//                    str += "O";
//                } else {
//                    str += ".";
//                }
            }
//            console.log(str);
//            str = "";
        }
        
    };
    this.populateLand = function(population) {
        
        if (population > (this.width * this.height)) {
            population = 1;
        }
        
        // Populate the land
        do {
            x = randomInt(0,(this.width-1));
            y = randomInt(0,(this.height-1));
            thing = this.getThingAt(x,y);
            if (thing.isDead()) {
                thing.setAlive();
                population--; // one down, more to go?
            }
            // else { Place was already occupied, lets try again.
            // - Not optimal but with relatively small numbers it works }
        } while(population > 0);
    };
    this.executeLife = function() {
        myLifeCycle++;
        for (i = 0; i < this.things.length; i++) {
            this.things[i].determineNextPhase(this);
        }
        for (i = 0; i < this.things.length; i++) {
            this.things[i].moveToNextPhase();
        }
        this.drawLand();
    };
};

var stateColor = {};

function initStateColors() {
    stateColor["DEAD"] = "gray";
    stateColor["ALIVE"] = "red";
};

function Thing(toX, toY, width, height, ctx) {
    this.currentState = "DEAD";
    this.nextState = "DEAD";
    this.x = toX;
    this.y = toY;
    this.w = width;
    this.h = height;
    this.context = ctx;
    this.setAlive = function() {
        this.currentState = "ALIVE";
    };
    this.isAlive = function() {
        return (this.currentState === "ALIVE")  ;
    };
    this.isDead = function() {
        return (this.currentState === "DEAD")  ;
    };
    this.drawThing = function() {
        this.context.beginPath();
        this.context.strokeStyle = "black";
        this.context.lineWidth = 1;
        this.context.fillStyle = stateColor[this.currentState];
        this.context.rect((this.x * this.w), (this.y * this.h), this.w, this.h); 
        this.context.stroke();
        this.context.fill();
    };
    this.amountOfNeighbours = function(land) {
        // NOTE! Remember to use valueOf otherwise when atX/Y changes
        // so changes this.x too - its a reference!
        var atX = this.x.valueOf(),
            atY = this.y.valueOf(),
            amount = 0,
            i = 0;
        // Go through directions 0 = N, 1 = NE, ...
        for (i = 0; i < 8; i++) {
            // Coordinates per direction
            switch(i) {
                case 0:
                    atY -= 1;
                    break;
                case 1:
                    atY -= 1;
                    atX += 1;
                    break;
                case 2:
                    atX += 1;
                    break;
                case 3:
                    atY += 1;
                    atX += 1;
                    break;
                case 4:
                    atY += 1;
                    break;
                case 5:
                    atY += 1;
                    atX -= 1;
                    break;
                case 6:
                    atX -= 1;
                    break;
                case 7:
                    atY -= 1;
                    atX -= 1;
                    break;
            }
            // Check for on the edge case
            // Remember table indexes from 0 to n, not from 1
            if (atY < 0) atY = (land.height - 1);
            if (atY >= land.height) atY = 0;
            if (atX < 0) atX = (land.width - 1);
            if (atX >= land.width) atX = 0;
            // Check the thing on the map at calculated coordinates
            thing = land.getThingAt(atX,atY);
            if (thing.isAlive()) {
                amount++;
            }
            // Reset and repeat
            atX = this.x.valueOf();
            atY = this.y.valueOf();
        }
        return amount;
    };
    this.determineNextPhase = function(land) {
        /*
         * Any live cell with fewer than two live neighbours dies, as if caused by under-population.
         * Any live cell with two or three live neighbours lives on to the next generation.
         * Any live cell with more than three live neighbours dies, as if by overcrowding.
         * Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
         */
        var neighbours = this.amountOfNeighbours(land);
        
        if (this.isAlive()) {
            if (neighbours < 2) {
                this.nextState = "DEAD"; // under-population
            } else if (neighbours > 3) {
                this.nextState = "DEAD"; // over-population
            } else { 
                this.nextState = "ALIVE"; // balance
            }
        } else {
            if (neighbours === 3) {
                this.nextState = "ALIVE"; // reproduction
            } else {
                this.nextState = "DEAD"; // just stay dead
            }
        }
    };
    this.moveToNextPhase = function() {
        this.currentState = this.nextState;
        this.nextState = "DEAD";
    };
};

function handleCreateButton(event) {
    
    console.log(event);
    
    if (myLifeTimer !== null) {
        window.clearInterval(myLifeTimer);
        myLifeTimer = null;
        document.getElementById('gameToggleButton').value = "START";
    }
    
    // Get the user parameters
    var w = parseInt(document.getElementById('mapWidth').value),
        h = parseInt(document.getElementById('mapHeight').value),
        p = parseInt(document.getElementById('mapPopulation').value),
        t = parseInt(document.getElementById('lifeTimer').value),
        c = document.getElementById('theCanvas');

    // If any of parameters is missing use these defaults
    if (isNaN(w) || w <= 10 || w > 100) {
        w = 20;
        document.getElementById('mapWidth').value = "20";
    }
    if (isNaN(h) || h <= 10 || h > 100) {
        h = 20;
        document.getElementById('mapHeight').value = "20";
    }
    if (isNaN(p) || p <= 0 || p > (w * h)) {
        p = 50;
        document.getElementById('mapPopulation').value = "50";
    }
    if (isNaN(t) || t < 100 || t > 10000) {
        t = 1000;
        document.getElementById('lifeTimer').value = "1000";
    }

    myLand = new Land(c, w, h);
    myLand.createLand();
    myLand.populateLand(p);
    myLand.drawLand();
    
    myLifeInterval = t;
}

function handleToggleButton(event) {
    
    console.log(event);

    if (TESTING) {
        if (TESTMAP >= testMaps.length) {
            TESTMAP = 0;
        }
        if (myLifeTimer === null) {
            event.target.value = "STOP";
            testMap(document.getElementById('theCanvas'), TESTMAP++);
            myLifeTimer = setInterval(function () {myLand.executeLife();}, 1000);
        } else {
            window.clearInterval(myLifeTimer);
            myLifeTimer = null;
            event.target.value = "START";
        }
    } else {
        if (myLand !== null) {
            if (myLifeTimer === null) {
                // Start
                event.target.value = "STOP";
                myLifeTimer = setInterval(function () {myLand.executeLife();}, myLifeInterval);
            } else {
                // Stop
                window.clearInterval(myLifeTimer);
                myLifeTimer = null;
                event.target.value = "START";
            }
        }
    }
};

var myLand = null;
var myLifeTimer = null;
var myLifeInterval = 1000;
var myLifeCycle = 0;

window.onload = function(event) {
  
    console.log(event);

    initStateColors();

    document.getElementById('gameCreateButton').addEventListener('click',handleCreateButton);
    document.getElementById('gameToggleButton').addEventListener('click',handleToggleButton);

};

// Known patterns for testing
var TESTING = false;
var TESTMAP = 0;

var testMap0 = [
        ".........................",
        ".........................",
        ".OOO.............OOO.....",
        "..OOO...........OOO......",
        ".........................",
        "........................."
];
var testMap1 = [
        ".........................",
        "...............O.........",
        "...OOO.........O.........",
        "...............O.........",
        "........................."
];
var testMap2 = [
        ".........................",
        ".........................",
        "..O......................",
        "O.O......................",
        ".OO......................",
        ".........................",
        "........................."
];
var testMap3 = [
        ".........................",
        "......OO.................",
        "....OO.OO................",
        "....OOOO.................",
        ".....OO..................",
        ".........................",
        "........................."
];
var testMap4 = [
        ".........................",
        ".........................",
        "........OOO...OOO........",
        ".........................",
        "......O....O.O....O......",
        "......O....O.O....O......",
        "......O....O.O....O......",
        "........OOO...OOO........",
        ".........................",
        "........OOO...OOO........",
        "......O....O.O....O......",
        "......O....O.O....O......",
        "......O....O.O....O......",
        ".........................",
        "........OOO...OOO........",
        ".........................",
        "........................."
];
var testMaps = [
        testMap0,testMap1,testMap2,testMap3,testMap4
];
    
function testMap(canvas, nbr) {
        var testThisMap = testMaps[nbr];
        var height = testThisMap.length;
        var row = testThisMap[0];
        var width = row.length;
        var x,y;
    
        canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
    
        myLand = new Land(canvas, width, height);

        myLand.createLand();
        
        // Populate land according to testMap
        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                if (testThisMap[y].charAt(x) === 'O') {
                    myLand.setThingAliveAt(x,y);
                }
            }
        }
        
        myLand.drawLand();
    }
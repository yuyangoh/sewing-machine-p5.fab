let keyIsHeld = false;
let keyPressStartTime = 0;
let loopIndex = 0;
let loopActive = false;
let liftOff = false;
let runOnce = false;
//let runOnceOnRelease = false;
//let maxLoops = 1;
let lastLoopTime = 0;
let loopInterval = 7000; // milliseconds between loops
let runOnceTriggered = false;
let clearCommandStream = false;

// variables for stitch
let surfaceHeight = 12; //mm
let dipDist = 5; //mm
let elevationHeight = 3; //mm
let liftHeight = 2; //mm
let x = fab.centerX + 30;
let y = fab.centerY;
let calibrateX = 0;
let dipSpeed = 0.8; // mm/sec
let elevateSpeed = 4; // mm/sec
let liftSpeed = 35; // mm/sec

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.elt.focus()
}

function keyPressed() {
  if (key == ' ') {
    keyPressStartTime = millis();
    loopIndex = 0;
    clearCommandStream = false;
    if (keyPressStartTime > 1000) {
      loopActive = true;
      keyIsHeld = true;
      runOnce = false;
    } else {
      runOnce = true;
      keyPressStartTime = 0;
      keyIsHeld = false;
    }
  }

}

function keyReleased() {
  if (key === ' ') {
    keyPressStartTime = 0;
    keyIsHeld = false;
    liftOff = true;
  }
}

function fabDraw() {
  // setup!
  fab.autoHome();
  fab.setTemps(200, 30);
  // move to safe height
  // moveExtrude(x, y, z, v = 25, e = null, multiplier = false) 
  console.log("start calibration");
  fab.moveExtrude(0, 0, surfaceHeight + elevationHeight, 25, 0);

  // calibrate flow
  // move to calibration spot and extrude 1 mm to start filament flow
  fab.moveExtrude(x, y, surfaceHeight + elevationHeight, 25, 2);
}

function runLoop() {
  console.log("run once");

  fab.moveExtrude(x, y, surfaceHeight + elevationHeight, elevateSpeed, 1); // move to surface
  fab.moveExtrude(x, y, surfaceHeight - dipDist, elevateSpeed, 1); // dip
  //fab.add("G4 P3000"); // dwell
  fab.moveExtrude(x, y, surfaceHeight, dipSpeed, 1.2); // move to surface
  fab.moveExtrude(x, y, surfaceHeight + elevationHeight, elevateSpeed, 0.75); // elevate with coil
  //fab.add("G4 P1000");
  //fab.moveRetract(x, y, surfaceHeight + liftHeight, liftSpeed, 0);

  // When ready to stream:
  fab.commandStream = fab.commands.slice(); // Copy to commandStream

  // Start streaming (if not using fab.print()):
  fab.printStream(); // Sends the first command in the stream

  //loopIndex++;
  console.log(loopIndex);
}

function endLoop() {
  console.log("ending loop");
  console.log("Total runLoop() calls this cycle:", loopIndex); // Add this line
  loopActive = false;

  // after loop calibration
  //fab.moveRetract(x, y, surfaceHeight + elevationHeight, liftSpeed, 4);

  // When ready to stream:
  fab.commandStream = fab.commands.slice(); // Copy to commandStream

  // Start streaming (if not using fab.print()):
  fab.printStream(); // Sends the first command in the stream

  clearCommandStream = true;
}

function draw() {
  background(255);
  fab.render();

  if (loopActive && !runOnce && keyIsHeld) {
    // run loop every loopInterval milliseconds
    if (millis() - lastLoopTime > loopInterval) {
      runLoop();
      loopIndex++;
      lastLoopTime = millis();
    }
  }

  if (runOnce && !keyIsHeld && liftOff && !runOnceTriggered) {
    // run loop once on key release
    runLoop();
    loopIndex++;
    runOnceTriggered = true;
  }

  if (liftOff) {
    endLoop();
    loopIndex = 0;
    liftOff = false;
    runOnce = false;
    keyIsHeld = false;
    runOnceTriggered = false;

    if (clearCommandStream) {
      fab.commandStream = [];
      clearCommandStream = false;
      console.log("clear command stream");
    }
  }
}
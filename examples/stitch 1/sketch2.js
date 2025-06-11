let keyIsHeld = false;
let loopIndex = 0;
let loopActive = false;
let liftOff = false;
let maxLoops = 1;
// variables for stitch
let surfaceHeight = 12; //mm
let dipDist = 3.5; //mm
let dipTime = 1000; //ms
let elevatedHeight = 17; //mm
let liftHeight = 20; //mm
let x = fab.centerX;
let y = fab.centerY;
let calibrateX = 0;
let dipSpeed = 10; // mm/sec
let elevateSpeed = 25; // mm/sec
let liftSpeed = 35; // mm/sec
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.elt.focus()
}
function keyPressed() {
  if (key == ' ' && !keyIsHeld) {
    // console.log("button pressed");
    keyIsHeld = true;
    //runLoop();
    loopActive = true;
  }
}
function keyReleased() {
  if (key === ' ') {
    //console.log("button released");
    keyIsHeld = false;
    liftOff = true;
    //endLoop();
  }
}
function fabDraw() {
  // setup!
  fab.autoHome();
  fab.setTemps(200, 30);
  // move to safe height
  // moveExtrude(x, y, z, v = 25, e = null, multiplier = false) 
  console.log("start calibration");
  fab.moveExtrude(0, 0, elevatedHeight, 25, 0);
  // calibrate flow
  // move to calibration spot and extrude 1 mm to start filament flow
  fab.moveExtrude(x, y, elevatedHeight, 25, 4);
}
function runLoop() {
  console.log("running loop");
  loopActive = true;
  fab.moveExtrude(x, y, surfaceHeight, elevateSpeed, 1); // move to surface
  fab.moveExtrude(x, y, surfaceHeight - dipDist, dipSpeed, 1); // dip
  fab.add("G4 P2000"); // dwell
  fab.moveExtrude(x, y, surfaceHeight, dipSpeed, 1); // move to surface
  fab.moveExtrude(x, y, elevatedHeight, elevateSpeed, 2); // elevate with coil
  fab.add("G4 P500");
  // When ready to stream:
  fab.commandStream = fab.commands.slice(); // Copy to commandStream
  // Start streaming (if not using fab.print()):a
  fab.printStream(); // Sends the first command in the stream
  //loopIndex++;
  console.log(loopIndex);
}
function endLoop() {
  console.log("ending loop");
  loopActive = false;
  // after loop calibration
  fab.moveRetract(x, y, liftHeight, liftSpeed, 4);
  //fab.moveRetract(calibrateX, y, liftHeight, liftSpeed);
  // When ready to stream:
  fab.commandStream = fab.commands.slice(); // Copy to commandStream
  // Start streaming (if not using fab.print()):
  fab.printStream(); // Sends the first command in the stream
}
let lastLoopTime = 0;
let loopInterval = 5500; // milliseconds between loops
function draw() {
  background(255);
  fab.render();
  if (loopActive) {
    if (millis() - lastLoopTime > loopInterval) {
      runLoop();
      loopIndex++;
      lastLoopTime = millis();
    }
  }
  if (liftOff) {
    endLoop();
    liftOff = false;
    loopIndex = 0;
  }
}

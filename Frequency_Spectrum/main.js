var source, fft, largest;
var bNormalize = true;
var centerClip = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();

  source = new p5.AudioIn();
  source.start();

  fft = new p5.FFT();
  fft.setInput(source);
  peakDetect = new p5.PeakDetect(4000, 12000, 0.2);
  frameRate(240);
}

function draw() {
  background(255,30);
  fft.analyze();
  peakDetect.update(fft);
  // array of values from -1 to 1
  var timeDomain = fft.waveform(1024, 'float16');
  var corrBuff = autoCorrelate(timeDomain);
  // beginShape();
    for (var i = 0; i < corrBuff.length; i++) {
      var w = map(i, 0, corrBuff.length, 0, width);
      var h = map(corrBuff[i], -1, 1, height, 0);
      if (corrBuff[i]>largest) {
        largest = corrBuff[i];
      }
      if(corrBuff[i]>corrBuff[i+1] && corrBuff[i]>corrBuff[i-1]){
        // stroke(0,20);
        // line(0,h,windowWidth,h)
        strokeWeight(.8);
        strokeCap(SQUARE);
        stroke(h*100,0,0)
        line(w-10, h,w+10,h);
      } else if (corrBuff[i]<corrBuff[i+1] && corrBuff[i]<corrBuff[i-1]){
        // stroke(100,20);
        // line(0,h,windowWidth,h)
        stroke(0,h*100,h*100)
        line(w-20, h,w+20,h);
      }

    }
    // endShape();
}


function autoCorrelate(buffer) {
  var newBuffer = [];
  var nSamples = buffer.length;
  var autocorrelation = [];

  // center clip removes any samples under 0.1
  if (centerClip) {
    var cutoff = 0.1;
    for (var i = 0; i < buffer.length; i++) {
      var val = buffer[i];
      buffer[i] = Math.abs(val) > cutoff ? val : 0;
    }
  }

  for (var lag = 0; lag < nSamples; lag++){
    var sum = 0;
    for (var index = 0; index < nSamples; index++){
      var indexLagged = index+lag;
      if (indexLagged < nSamples){
        var sound1 = buffer[index];
        var sound2 = buffer[indexLagged];
        var product = sound1 * sound2;
        sum += product;
      }
    }

    // average to a value between -1 and 1
    newBuffer[lag] = sum/nSamples;
  }

  if (bNormalize){
    var biggestVal = 0;
    for (var index = 0; index < nSamples; index++){
      if (abs(newBuffer[index]) > biggestVal){
        biggestVal = abs(newBuffer[index]);
      }
    }
    for (var index = 0; index < nSamples; index++){
      newBuffer[index] /= biggestVal;
    }
  }

  return newBuffer;
}

function mousePressed() {
  saveFrames("out", "png", 1, 25, function(data){
    print(data);
  });
}

// https://github.com/LividInstruments/wa_waveform/blob/master/main.js

module.exports.draw = function (width, height, canvasctx, buffer, callback) {
  console.time("waveform.draw");
  
  //const
  var sampsPerPix = 1;
  var ms = 1000; //placeholder for length
  const sr = 44.1; //so we can get length in ms 
  var wavethickness = 1; //width of pen drawing the waveform. adjust to taste
  var wavecolor = '#F2E138';
  var backcolor = '#343752';
  
  var data = buffer.getChannelData(0);
  var last = data.length-1;
  var width_scaled = width; //the offscreen canvas is a different size from the canvas in the UI, so we adjust for that with wavescale
  sampsPerPix = (800 / width_scaled);
  ms = data.length/sr;
  
  var showdata = data;


  //number of samples per pixel for current view
  var binsize = Math.floor(showdata.length / width);
  var amp = height / 2;
  canvasctx.fillStyle = backcolor;
  canvasctx.fillRect(0, 0, width, height);
  var lim = (last<width) ? last:width; //clip for short samples, if there's fewer than # of pixels in width
  canvasctx.beginPath();
  canvasctx.lineWidth = wavethickness;
  canvasctx.moveTo(0, amp);
  
  //figure out what to draw in this pixel, based on all the samples in the bin:
  for (var i = 0; i < lim; i++) {
      var min = 1.0;
      var max = -1.0;
      var dodraw = true;
            
      //scan all samples that are in a 'pixel' to find the hi and low values in the bin:
      for (var j = 0; j < binsize; j++) {
          var datum = showdata[(i * binsize) + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
      }
      
      var x = i;
      var y = (1 + min) * amp;
      var h = Math.max(1, (max - min) * amp);
      canvasctx.lineTo(x, y);
      canvasctx.lineTo(x, y+h);
  }
  
  canvasctx.strokeStyle = wavecolor;
  canvasctx.stroke();
  
  console.timeEnd("waveform.draw");
  
  callback(null);
}

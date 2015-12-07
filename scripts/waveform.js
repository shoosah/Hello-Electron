// https://github.com/LividInstruments/wa_waveform/blob/master/main.js

//DRAW WAVE draws to hidden canvas where we copy the pixels to the interactive canvas. This speeds up drawing when using in/out visual selection handles.
module.exports.draw = function (width, height, canvasctx, buffer, callback) {
  console.time("waveform.draw");
  
  //const
  const wavescale = 1; //scale the off-screen canvas for image quality. 2 seems the best
  var sampsPerPix = 1;
  var ms = 1000; //placeholder for length
  const sr = 44.1; //so we can get length in ms 
  var wavethickness = 1; //width of pen drawing the waveform. adjust to taste
  var wavecolor = '#F2E138';
  var backcolor = '#343752';
  
  var data = buffer.getChannelData(0);
  var last = data.length-1;
  var width_scaled = width/wavescale; //the offscreen canvas is a different size from the canvas in the UI, so we adjust for that with wavescale
  sampsPerPix = (800 / width_scaled);
  ms = data.length/sr;
  
  // //calculate view in and point points based on current visual selection:
  // var in_ = view_samps[0] + Math.floor(sel_pix[0] * sampsPerPix);
  // var out_ = view_samps[1] - Math.floor( (width_scaled - sel_pix[1]) * sampsPerPix );
  // view_samps = [in_,out_]; 
  
  //make a table of the visible samples:
  // var showdata = [];
  // for (i=0; i< (out_-in_);i++){
  //   showdata[i] = data[i + in_];
  // }

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
      for (j = 0; j < binsize; j++) {
          var datum = showdata[(i * binsize) + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
          if (datum === undefined) dodraw = false; //probably not needed
      }
      if(dodraw){
        var x = i;
        var y = (1 + min) * amp;
        var h = Math.max(1, (max - min) * amp);
        canvasctx.lineTo(x, y);
        canvasctx.lineTo(x, y+h);
      }
  }    
  canvasctx.strokeStyle = wavecolor;
  canvasctx.stroke();
  
  console.timeEnd("waveform.draw");
  
  callback(null);
}

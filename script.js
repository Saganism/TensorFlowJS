let demoSection = document.getElementById('demos')
let liveView = document.getElementById('liveView')
let video = document.getElementById('webcam')
let webcamButton = document.getElementById('webcamButton')


// Write code to allow camera stream

// navigator.mediaDevices && navigator.mediaDevices.getUserMedia

function getUserMediaSupported(){
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

if(getUserMediaSupported()){
  webcamButton.addEventListener('click', enableWebcam)
}
else{
  console.warn("Your Browser Does Not Support Usermedia")
}

function enableWebcam(){
  if(!model){
    return
  }
  
  event.target.classList.add('removed')
  
  const constraints = {
    video: true
  }
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
    video.srcObject = stream;
    video.addEventListener('loadeddata',predictWebcam)
  })
}

var model = undefined
// Load COCOSSD Model
cocoSsd.load().then(function(loadedModel){
  model = loadedModel;
  demoSection.classList.remove('invisible')
})

var children = []

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    
    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }
    
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}
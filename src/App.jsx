import React, {useRef,useEffect} from 'react'
import './App.css'
import * as faceapi from 'face-api.js'

function App(){
  const [rbfval, setRbfval] = React.useState('');

  const videoRef = useRef()
  const canvasRef = useRef()

  useEffect(()=>{
    startVideo()
    videoRef && loadModels()
  },[])

  const startVideo = ()=>{
    navigator.mediaDevices.getUserMedia({video:true})
    .then((currentStream)=>{
      videoRef.current.srcObject = currentStream
    })
    .catch((err)=>{
      console.log(err)
    })
  }

  const loadModels = ()=>{
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models")
      ]).then(()=>{
      detectFace()
    })
  }

  const detectFace = () => {
    setInterval( async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current,
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      setRbfval(detections[0].expressions.angry.toFixed(2))
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current)
      faceapi.matchDimensions(canvasRef.current,{
        width:940,
        height:650
      })

      const resized = faceapi.resizeResults(detections,{
         width:940,
        height:650
      })

      faceapi.draw.drawDetections(canvasRef.current,resized)
      faceapi.draw.drawFaceLandmarks(canvasRef.current,resized)
      faceapi.draw.drawFaceExpressions(canvasRef.current,resized)
      
    }, 1000)
  }

  return (
    <div className="grid place-items-center space-y-5">
      <h1 className='flex justify-center p-5 text-lg font-bold'>RBF Test</h1>
      <div className="relative flex items-center">
        <video className='z-0' crossOrigin="anonymous" width="940" height="650" ref={videoRef} autoPlay></video>
        <canvas ref={canvasRef} width="940" height="650" className="absolute z-50"/>
      </div>
      <div>
        RBF Percentage: {rbfval}%
      </div>
    </div>
    )

}

export default App;
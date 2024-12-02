import { useState,useEffect,useRef,useCallback } from 'react'

import './App.css'


function App() {

  const [imageSize, setImageSize] = useState({ width: 0, height: 0,x:0,y:0 });
  const [scale, setScale] = useState(1);
  const [drag,setDrag]=useState(false)
  const [top,setTop]=useState(window.screen.availHeight/2)
  const [left,setLeft]=useState(window.screen.availHeight/2)
  const [doneSetPosition,setDoneSetPosition]=useState(false)
  const imgRef = useRef(null);
  const containerRef=useRef(null)
  const canvasRef=useRef(null)
  // console.log(Image())
  
  const updateImageSize = useCallback(() => {
    // console.log('updating image size');
    if (imgRef.current ) {
      const { width, height,x,y } = imgRef.current.getBoundingClientRect();
      // console.log(imgRef.current.getBoundingClientRect())
      
      setImageSize({ width, height,x,y });
      // console.log(imgRef.current)
      // setTop(height/2)
      // setLeft(width/2)
    }
  },[]);
  
  const handleWheel= useCallback((e)=>{
    // console.log(e,e.target,e.deltaY)
    if(containerRef.current && e.target.localName==='canvas'){
  // console.log(containerRef.current)
  if(e.deltaY<0){
  setScale((prevScale) => Math.min(prevScale + 0.1, 3)); // Scale up, max scale 3
  } else {
  setScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Scale down, min scale 0.5
       
  }
 updateImageSize();
    }
  },[]);

  const handleClick=useCallback((e)=>{
    console.log('clicked on =>',e.target)
  },[])

  const handleMousedown=useCallback((e)=>{
    
      
      setDrag(true)
      // console.log('drag=true')
  
  },[])

  const handleMouseup=useCallback((e)=>{
    setDrag(false)
    // console.log('drag=false')
  },[])

  const handleMousemove=useCallback((e)=>{
    if(drag){
      // console.log('moving',drag)
      // console.log(e,e.clientX,e.clientY)
      // console.log('movement',e.movementX,e.movementY)
      setTop((prev)=>prev+=e.movementY)
     setLeft((prev)=>prev+=e.movementX)
    }
  },[drag,containerRef.current])


//adjust initial position by width/2 and height/2
  useEffect(()=>{
    if(!doneSetPosition){
   
  if(imageSize.width>0 && imageSize.height>0 && canvasRef.current){
const width=imageSize.width;
const height=imageSize.height;

    setTop((prev)=>{
      const newTop=prev-(height/2);
    return newTop
    })
    setLeft((prev)=>{
      const newLeft=prev-(width/2);
    return newLeft
    })
    setDoneSetPosition(true)
    updateImageSize()
  }
   
   
  }
    },[imageSize,canvasRef])

useEffect(()=>{
  //initial setup
  document.addEventListener('mousewheel',handleWheel)
  window.addEventListener('resize', updateImageSize); // Update on resize
  document.addEventListener('click',handleClick)
  if(canvasRef.current){
  canvasRef.current.addEventListener('mousedown',handleMousedown)
  }
  
  document.addEventListener('mouseup',handleMouseup)
  document.addEventListener('mousemove',handleMousemove)
  updateImageSize(); // Initial size
  return ()=>{
    document.removeEventListener('mousewheel',handleWheel)
    window.removeEventListener('resize',updateImageSize)
    document.removeEventListener('click',handleClick)
    if (canvasRef.current){
    canvasRef.current.removeEventListener('mousedown',handleMousedown)
    }
    document.removeEventListener('mouseup', handleMouseup);
    document.removeEventListener('mousemove', handleMousemove);
}
},[drag,canvasRef.current,containerRef.current])

useEffect(()=>{
  //handle image resizing or reposition
  updateImageSize(); 
},[containerRef.current])

useEffect(() => {
  //resize container containing image, therefore resize image
  if (containerRef.current) {
    containerRef.current.style.transform = `scale(${scale})`;
    updateImageSize();
  }
}, [scale]);


  return (
    <>
  <section className='controls'>
    <button>1</button>
      <div className='info'>
        <p>Width:{imageSize.width.toFixed(2)}</p>
        <p>Height:{imageSize.height.toFixed(2)}</p>
      </div>
      <div className='info'>
        <p>Top:{imageSize.y.toFixed(2)}</p>
        <p>Left:{imageSize.x.toFixed(2)}</p>
      </div>
      <div className='info'>
        <p>Scale:{scale.toFixed(2)}</p>
      </div>
  </section>

  <div ref={containerRef} className='container' style={{top:top,left:left,}} >
    <img ref ={imgRef} src='/images/zx81Desk.png' />
  </div>

  {imageSize.height>0 && imageSize.width>0 && 
  <canvas ref ={canvasRef} style={{width:imageSize.width,height:imageSize.height,top:imageSize.y,left:imageSize.x}}>
    
  </canvas>
  }
    </>
  )
}

export default App

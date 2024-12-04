import { useState,useEffect,useRef,useCallback } from 'react'

import './App.css'


function App() {

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0,x:0,y:0 });
  const [scale, setScale] = useState(1);
  const [drag,setDrag]=useState(false)
  const [top,setTop]=useState(100)
  const [left,setLeft]=useState(0)
  const [doneSetPosition,setDoneSetPosition]=useState(false)
  const [isDragging,setIsDragging]=useState(false)
  const [mode,setMode]=useState('position')
  const controlRef=useRef(null)
  const imgRef = useRef(null);
  const containerRef=useRef(null)
  const canvasRef=useRef(null)
  // console.log(Image())
  
  const updatecontainerSize = useCallback(() => {
    console.log('updating container size');
    if (imgRef.current ) {
      const { width, height,x,y } = imgRef.current.getBoundingClientRect();
      // console.log(imgRef.current.getBoundingClientRect())
      
      setContainerSize({ width,height,x,y });
      // console.log(imgRef.current)
      // setTop(height/2)
      // setLeft(width/2)
    }
  },[]);
  useEffect(()=>{
updatecontainerSize()
  },[top,left])
  
  // const updateContainerSize=useCallback(()=>{
  //   console.log('here')
  //   // if(containerRef.current){
  //   //   console.log('updating container size')
  //   //   containerRef.current.style.width='100%';
  //   // }
  // },[containerRef.current])
  
  const handleWheel= useCallback((e)=>{
    // console.log(e,e.target,e.deltaY)
    if(containerRef.current && e.target.localName==='canvas'){
  // console.log(containerRef.current)
  if(e.deltaY<0){
  setScale((prevScale) => Math.min(prevScale + 0.1, 3)); // Scale up, max scale 3
  } else {
  setScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Scale down, min scale 0.5
       
  }
 updatecontainerSize();
    }
  },[]);
  useEffect(() => {
    //resize container containing image, therefore resize image
    if (imgRef.current) {
     imgRef.current.style.transform = `scale(${scale})`;
      updatecontainerSize();
    }
  }, [scale]);

  const handleClick=useCallback((e)=>{
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      return;
    }
    console.log('clicked on =>',e.target)
  },[isDragging])

  const handleMousedown=useCallback((e)=>{
    
      
      setDrag(true)
      setIsDragging(false)
      // console.log('drag=true')
  
  },[])

  const handleMouseup=useCallback((e)=>{
    setDrag(false)
    // console.log('drag=false')
  },[])

  const handleMousemove=useCallback((e)=>{
    if(drag && mode==='position'){
      // console.log('moving',drag)
      // console.log(e,e.clientX,e.clientY)
      // console.log('movement',e.movementX,e.movementY)
      setTop((prev)=>{
        const controlHeight=controlRef.current.getBoundingClientRect().height
        const yLimit=document.body.getBoundingClientRect().height;
      const containerHeight=containerRef.current.getBoundingClientRect().height*scale;

      console.log('top',prev)

    
     return prev+=e.movementY
    })
     setLeft((prev)=>{
      const xLimit=document.body.getBoundingClientRect().width;
      const containerWidth=containerRef.current.getBoundingClientRect().width
      // console.log('left',prev,left)
      return prev+=e.movementX})
     setIsDragging(true)
    }
  },[drag,containerRef.current,controlRef.current])


// adjust initial position by width/2 and height/2
//   useEffect(()=>{
//     if(!doneSetPosition){
   
//   if(containerSize.width>0 && containerSize.height>0 && canvasRef.current){
// const width=containerSize.width;
// const height=containerSize.height
//     setTop((prev)=>{
//       const newTop=prev-(height/2);
//     return newTop
//     })
//     setLeft((prev)=>{
//       const newLeft=prev-(width/2);
//     return newLeft
//     })
//     setDoneSetPosition(true)
//     updatecontainerSize()
//   }
   
   
//   }
//     },[containerSize,canvasRef])

useEffect(()=>{
  //initial setup
  document.addEventListener('mousewheel',handleWheel)
  window.addEventListener('resize', updatecontainerSize); // Update on resize

  if(canvasRef.current){
  canvasRef.current.addEventListener('mousedown',handleMousedown)
  canvasRef.current.addEventListener('click',handleClick)
  }
  
  document.addEventListener('mouseup',handleMouseup)
  document.addEventListener('mousemove',handleMousemove)
  updatecontainerSize(); // Initial size
  return ()=>{
    document.removeEventListener('mousewheel',handleWheel)
    window.removeEventListener('resize',updatecontainerSize)
    document.removeEventListener('click',handleClick)
    if (canvasRef.current){
    canvasRef.current.removeEventListener('mousedown',handleMousedown)
    canvasRef.current.removeEventListener('click',handleClick)
    }
    document.removeEventListener('mouseup', handleMouseup);
    document.removeEventListener('mousemove', handleMousemove);
}
},[drag,canvasRef.current,containerRef.current])

// useEffect(()=>{
//   //handle image resizing or reposition
//   updatecontainerSize(); 
// },[containerRef.current])




useEffect(()=>{
if(canvasRef.current){
  const ctx=canvasRef.current.getContext('2d')
  draw(ctx)
}
},[canvasRef.current])

const draw=(ctx)=>{
  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear the canvas
  ctx.globalCompositeOperation = 'difference'; // Set the composite operation to 'difference'
  ctx.strokeStyle = 'white'; // Set the stroke color to white

  ctx.beginPath();
  ctx.moveTo(50, 50);
  ctx.lineTo(100, 50);
  ctx.lineTo(100, 100);
  ctx.lineTo(50,100);
  ctx.closePath();
  ctx.stroke();
}


  return (
    <>
  <section ref={controlRef} className='controls'>
  <div className='control-buttons'>

    <button onClick={()=>setMode('position')} style={{backgroundColor:mode==='position'?'red':'black'}}>Position</button>
    <button onClick={()=>setMode('adjust')} style={{backgroundColor:mode==='adjust'?'red':'black'}}>Adjust</button>
  </div>
      <div className='info'>
        <p>Width:{containerSize.width.toFixed(2)}</p>
        <p>Height:{containerSize.height.toFixed(2)}</p>
      </div>
      <div className='info'>
        <p>Top:{containerSize.y.toFixed(2)}</p>
        <p>Left:{containerSize.x.toFixed(2)}</p>
      </div>
      <div className='info'>
        <p>Scale:{scale.toFixed(2)}</p>
      </div>
  </section>

  <div ref={containerRef} className='container' style={{top:top,left:left}} >
    <img ref ={imgRef} src='/images/zx81Desk.png' style={{}}/>
  </div>
  {containerSize.height>0 && containerSize.width>0 && 
  <canvas ref ={canvasRef} style={{width:containerSize.width,height:containerSize.height,top:containerSize.y,left:containerSize.x}}>
  </canvas>
  }

    </>
  )
}

export default App

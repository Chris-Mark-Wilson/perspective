import { useState,useEffect,useRef,useCallback } from 'react'

import './App.css'


function App() {

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0,x:0,y:0 });
  const [scale, setScale] = useState(1);
  const [drag,setDrag]=useState(false)
  const [top,setTop]=useState(100)
  const [left,setLeft]=useState(0)
  const [polygonPosition,setPolygonPosition]=useState({tl:{x:50,y:50},tr:{x:200,y:50},bl:{x:50,y:200},br:{x:200,y:200}})

  const [isDragging,setIsDragging]=useState(false)
  const [mode,setMode]=useState('position')
  const controlRef=useRef(null)
  const imgRef = useRef(null);
  const containerRef=useRef(null)
  const canvasRef=useRef(null)

  
  const updatecontainerSize = useCallback(() => {
    if (imgRef.current ) {
      const { width, height,x,y } = imgRef.current.getBoundingClientRect();
      setContainerSize({ width,height,x,y });
      // if(top!=y && left!=x){
      // setTop(y);
      // setLeft(x);
      // }
    }
  },[]);

  useEffect(()=>{
    updatecontainerSize()
  },[top,left])
  

  
  const handleWheel= useCallback((e)=>{
    // console.log(e,e.target,e.deltaY)
    if(containerRef.current && e.target.localName==='canvas'){
      if(e.deltaY<0){
      setScale((prevScale) => Math.min(prevScale + 0.1, 3)); // Scale up, max scale 3
      } else {
      setScale((prevScale) => Math.max(prevScale - 0.1, 0.3)); // Scale down, min scale 0.5
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
    if(mode==='position') reset()
    if(mode==='set'){
      console.log(e.layerX,e.layerY)
    }
  },[isDragging])

    const reset=useCallback(()=>{
      setTop(100);
      setLeft(0)
      setScale(1)
      updatecontainerSize()
    },[])

  const handleMousedown=useCallback((e)=>{
      setDrag(true)
      setIsDragging(false)
      
  },[])

  const handleMouseup=useCallback((e)=>{
    setDrag(false)
    // console.log('drag=false')
  },[])

 

  //Drag image or div
  const handleMousemove=useCallback((e)=>{
   
    const x=(e.clientX-containerSize.x);
    const y=(e.clientY-containerSize.y);
    if(drag && mode==='position'){
       //move div
      // using containerSize NOT top and left because react not updating
      console.log('x,y=>',x,y)
      console.log('top,left=>',top,left)
     
      if(isPointInPolygon({x,y},polygonPosition)){
        console.log('in polygon')
        //move polygon
        setPolygonPosition((prev)=>{
          console.log('prev',{...prev})
         const {tl,tr,bl,br}=prev
         const newPosition={tl,tr,bl,br}
         
          console.log('oldPosition',tl,tr,bl,br)
          for(const corner in newPosition){
            console.log('position',corner)
            newPosition[corner].x+=e.movementX/2;
            newPosition[corner].y+=e.movementY/2;
          }
          console.log('newPosition',newPosition)
          return newPosition
        })
        const ctx=canvasRef.current.getContext('2d');
        draw(ctx)
        updatecontainerSize()
        setIsDragging(true)
      }else {
        //move entire image
      setTop((prev)=>prev+=e.movementY)
      setLeft((prev)=>prev+=e.movementX)
      updatecontainerSize()
      setIsDragging(true)
      }
    } else if(drag && mode==='set'){
     console.log('dragging in set path')
     console.log(x,y)
     for(const corner in polygonPosition){

      console.log('checking',corner,polygonPosition[corner].x,polygonPosition[corner].y)
      
      const position={tl:{x:polygonPosition[corner].x-10,y:polygonPosition[corner].y-10},tr:{x:polygonPosition[corner].x+10,y:polygonPosition[corner].y-10},bl:{x:polygonPosition[corner].x-10,y:polygonPosition[corner].y+10},br:{x:polygonPosition[corner].x+10,y:polygonPosition[corner].y+10}}

      if(isPointInPolygon({x,y},position)){
       console.log('dragging handle',corner)
        setPolygonPosition((prev)=>{
          console.log(corner,prev)
          console.log(e)
          let newPosition={...prev}
          newPosition[corner].x=e.layerX;
          newPosition[corner].y=e.layerY;
          return newPosition
        })
        const ctx=canvasRef.current.getContext('2d');
        draw(ctx)
        updatecontainerSize()
        setIsDragging(true)
        
      }
      
    }
    }
  },[drag,containerRef.current,controlRef.current,polygonPosition])

  const isPointInPolygon = (point, polygon) => {
    const { x, y } = point;
    const { tl, tr, bl, br } = polygon;
  
    const vertices = [tl, tr, br, bl];
    let isInside = false;
  
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x, yi = vertices[i].y;
      const xj = vertices[j].x, yj = vertices[j].y;
  
      const intersect = ((yi > y) !== (yj > y)) &&
                        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) isInside = !isInside;
    }
  
    return isInside;
  };


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


useEffect(()=>{
if(canvasRef.current){
  const canvas = canvasRef.current;
  const ctx=canvasRef.current.getContext('2d')

  const scale = window.devicePixelRatio; // Get the device pixel ratio
  canvas.width = canvas.offsetWidth * scale;
  canvas.height = canvas.offsetHeight * scale;
  ctx.scale(scale, scale); // Scale the context

  draw(ctx)
}
},[canvasRef.current,])

const drawHandles=(ctx)=>{
  const {tl,tr,bl,br}=polygonPosition
  for (const corner in polygonPosition){
    // ctx.globalCompositeOperation = 'difference'; 
    ctx.strokeStyle='blue'
    ctx.beginPath()
    ctx.moveTo(polygonPosition[corner].x-10,polygonPosition[corner].y-10)
    ctx.lineTo(polygonPosition[corner].x+10,polygonPosition[corner].y-10)
    ctx.lineTo(polygonPosition[corner].x+10,polygonPosition[corner].y+10)
    ctx.lineTo(polygonPosition[corner].x-10,polygonPosition[corner].y+10)
    ctx.closePath();
    ctx.stroke();
  }
}
const draw=(ctx)=>{
  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear the canvas
  // ctx.globalCompositeOperation = 'difference'; // Set the composite operation to 'difference'
  const {tl,tr,bl,br}=polygonPosition
  ctx.strokeStyle = 'red'; 
  ctx.lineWidth=1;
  // ctx.setLineDash([1,1])
  ctx.beginPath();
  // let region = new Path2D();
  ctx.moveTo(tl.x,tl.y);
  ctx.lineTo(tr.x,tr.y);
  ctx.lineTo(br.x,br.y);
  ctx.lineTo(bl.x,bl.y);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle='green'
  ctx.fill()
  drawHandles(ctx)
}


  return (
    <>
  <section ref={controlRef} className='controls'>
  <div className='control-buttons'>

    <button onClick={()=>setMode('position')} style={{backgroundColor:mode==='position'?'red':'black'}}>Position</button>
    <button onClick={()=>setMode('set')} style={{backgroundColor:mode==='set'?'red':'black'}}>Set path</button>
    <button onClick={reset} style={{backgroundColor:'green',fontSize:'0.8rem'}}>reset scale</button>
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

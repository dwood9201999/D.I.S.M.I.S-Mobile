// Offline schematic pictograms. Each drawing is paired with identification text.
export function drawPart(canvas, kind) {
  const pen = canvas.getContext('2d');
  if (!pen) return;
  pen.lineWidth = 3;
  pen.lineJoin = pen.lineCap = 'round';
  pen.strokeStyle = '#afe2a7';
  pen.fillStyle = '#eef6ed';
  pen.font = '12px system-ui';
  const line = (...points) => {
    pen.beginPath();
    points.forEach(([x, y], index) => index ? pen.lineTo(x, y) : pen.moveTo(x, y));
    pen.stroke();
  };
  const box = (x,y,w,h) => pen.strokeRect(x,y,w,h);
  const text = (label,x,y) => pen.fillText(label,x,y);
  const circle = (x,y,r) => { pen.beginPath(); pen.arc(x,y,r,0,Math.PI * 2); pen.stroke(); };
  const terminals = () => { line([32,47],[61,47]); line([139,47],[168,47]); };
  const drawings = {
    loop() { for (let i=0;i<5;i++) box(52+i*5,14+i*5,96-i*10,58-i*10); line([52,72],[52,85]); line([148,72],[148,85]); },
    capacitor() { for (let i=0;i<4;i++) line([60,28+i*10],[118,28+i*10]); line([105,17],[105,68],[146,68]); circle(152,68,7); },
    diode() { terminals(); box(61,36,78,22); box(124,36,7,22); text('band',116,27); },
    ear() { circle(87,40,23); circle(87,40,11); line([106,53],[135,72],[165,72]); },
    resistor() { terminals(); box(61,34,78,26); for (const x of [77,91,106,122]) line([x,36],[x,58]); },
    meter() { box(65,8,70,80); box(74,15,52,19); circle(100,51,10); text('COM',72,77); text('VΩ',110,77); },
    motor() { box(62,24,73,48); line([23,48],[62,48]); line([135,34],[159,34]); line([135,62],[159,62]); text('shaft',20,37); },
    regulator() { box(45,29,110,35); text('IN ±',51,51); text('OUT ±',114,51); circle(101,46,9); },
    load() { circle(95,32,22); box(85,52,20,20); line([90,72],[90,82]); line([100,72],[100,82]); },
    crank() { box(48,29,98,48); circle(116,52,9); line([116,52],[156,22],[172,22]); box(56,47,20,13); },
    receiver() { box(39,30,122,47); line([56,30],[70,8]); circle(136,53,12); box(53,44,54,17); text('AM / WX',58,57); },
    usb() { box(58,30,78,39); box(136,39,22,22); line([58,50],[23,50]); text('USB',81,55); },
    panel() { box(48,15,104,62); for (const x of [74,100,126]) line([x,15],[x,77]); for (const y of [36,57]) line([48,y],[152,y]); },
    controller() { box(38,20,124,56); box(72,30,55,16); text('PV ±     BAT ±',57,66); },
    battery() { box(49,34,102,39); box(60,25,15,9); box(125,25,15,9); text('−',63,54); text('+',128,54); },
    fuse() { terminals(); box(61,32,78,30); line([69,47],[83,47],[92,39],[104,54],[116,47],[132,47]); },
    turbine() { circle(98,47,7); line([98,40],[91,13],[103,16],[104,41]); line([104,48],[133,55],[124,65],[103,54]); line([92,49],[67,66],[64,55],[91,43]); },
    handheld() { box(75,31,45,55); line([83,31],[83,9]); box(82,39,31,14); line([72,43],[72,57]); for (const y of [63,70,77]) line([86,y],[108,y]); },
  };
  drawings[kind]();
}

console.clear();
/* Dylan Cowden 2x2 cube puzzle
 * updated comment 1/14/2019
 */
var gl;
var vPosition, vColor;
var xang, yang, zang, sx, cm;

var mesh = new Array();
var color = new Array();
var angles = new Array();
var cubeRots = new Array()

var dx = new Array();
var dy = new Array();

var orient = new Array();
var ornts = new Array();
var ovar = new Array();

var canvas;
var x, y, x_c, y_c, m, b;
var o_face;
var N=10.0;
var NUMBER_SQUARES = 8; //<------- # squares
var SCALE = 0.05;

var confT = 0;

function config() {
    
	/*document.getElementById('rotx').onchange = function(event) { rotX(); }
    document.getElementById('roty').onchange = function(event) { rotY(); }
    document.getElementById('rotz').onchange = function(event) { rotZ();}//rotZ(); }*/
    document.getElementById('face0').onclick = function(event) {rotate(0);} //face 0 <-> orange
    document.getElementById('face1').onclick = function(event) {rotate(1);} //face 1 <-> blue
    document.getElementById('face2').onclick = function(event) {rotate(2);} //face 2 <-> yellow
    document.getElementById('face3').onclick = function(event) {rotate(3);} //face 3 <-> red 
    document.getElementById('face5').onclick = function(event) {rotate(5);} //face 4 <-> green
    document.getElementById('face4').onclick = function(event) {rotate(4);} //face 5 <-> white
	//document.getElementById('number').onchange = function(event) { rotate();}//orender(0,3);}//changevalue(event) };
    
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
	mesh = new Array();
	color = new Array();
	angles = new Array();
	cubeRots = new Array(6);//6); //cube rotation array with an index for each face of the cube
	
	dx = new Array();
	dy = new Array();
	
	orient = new Array(3);
	ornts = new Array(8);
	ovar = new Array(2);
	
	o_face = 0;
    gl.clearDepth(1.0);                
    gl.enable(gl.DEPTH_TEST);           
    gl.depthFunc(gl.LEQUAL); 

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
       
    vPosition = gl.getAttribLocation( program, "vPosition" );
    vColor = gl.getAttribLocation( program, "vColor" );
    xang = gl.getUniformLocation( program, "xang" );
    yang = gl.getUniformLocation( program, "yang" );
    zang = gl.getUniformLocation( program, "zang" );
    sx = gl.getUniformLocation( program, "scale" );
    cm = gl.getUniformLocation( program, "cm" );
    
	for (var y = 0; y<3;y++) orient[y] = 0;
	for (var y = 0; y<8;y++) {
		ornts[y] = new Array(2);
		ornts[y][0] = 0;
		ornts[y][1] = 2;
	}
	ovar[0] = 0; ovar[1] = 2;
	for (var y = 0; y<6;y++) {
		cubeRots[y] = 0;
	}
	for(var y=0;y<NUMBER_SQUARES;y++){
		
		//var n = 45*confT;
		//n = n%360;
		var n = 0;
		
		angles[y] = new Array();
		angles[y][0]=n;//randomRange(0,359);
		angles[y][1]=n;//randomRange(0,359);
		angles[y][2]=n;//randomRange(0,359);
		createMesh(y);
	}
	//confT = 1;
    createColors();
    bufferData();
    

    
    gl.uniform1f( sx, SCALE );
    gl.uniform4f( cm, 0.0, 0.0, 0.0, 0.0); 
    
    x=0.0;
    y=0.0;
    x_c=0.0;
    y_c=0.0;
    m=0.0;
    cubeRender();
	//orender(0,3);
    //animate();
}

function getClickPosition( event ) {
    
    dx = [];
    dy = [];
    b=0;
    
    var parentPosition = getPosition(event.currentTarget);
    x = ( event.clientX - parentPosition.x );
    y = ( event.clientY - parentPosition.y );
    
    if ( x > canvas.width ) x = canvas.width;
    if ( y > canvas.height ) y = canvas.height;
    
    x = (2*(x/canvas.width))-1.0;
    y = (-2*(y/canvas.height))+1.0;
    
    var xx = (x-x_c)/N;
    var yy = (y-y_c)/N;
    
    for ( var i=0; i<=N; i++ ) {
        
        dx.push( ( x_c+(i*xx) ) );
        dy.push( ( y_c+(i*yy) ) );
            
    }
    
}

function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;
      
    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}

function getRight(ffront,ftop) {
	var y = 0; 
	var t = 0; //is front before top in seq?
	while (y == ffront%3 || y == ftop%3) y++;
	if (ffront < ftop && ffront+2>=ftop) t = 1;
	else if (ffront + 2 >= ftop + 6) t = 1;
	
	if (t == 0 && y%3 == 1) y+=3;
	else if (t==1&&y%3!=1) y+=3;
	o_face = y;
	console.log(ffront+' '+ftop+'->'+o_face);
	return y;
}

function getOrientation(ffront, ftop) {
	ffront = ffront%6;
	ftop = ftop%6;
	var f = ftop;
	var ornt = new Array(3);
	ornt[0] = 0;
	ornt[1] = 0;
	ornt[2] = 360;
	if (ffront%3 == ftop %3) {
		ornt[2]=ornt[2]%360;
		return;
	}
	switch(ffront) {
		case 0:
			ornt[0] = 0;
			ornt[1] = 0;
			f = ftop+4;
			break;
		case 1:
			ornt[0] = 180;
			ornt[1] = 90;
			f = ftop+1;
			break;
		case 2:
			ornt[0] = 270;
			ornt[1] = 0;
			f = ftop+3;
			break;
		case 3:
			ornt[0] = 180;
			ornt[1] = 0;
			f=ftop+1;
			break;
		case 4:
			ornt[0] = 0;
			ornt[1] = 270;
			f=ftop+4;
			break;
		case 5:
			ornt[0] = 90;
			ornt[1] = 0;
			f=ftop+3;
			break;
	}
	f=f%6;
	var y = 0;
	while (y<f) {
		if (y%3!=ffront%3) {
			ornt[2] = ornt[2]-90;
		}
		y++;
	}
	ornt[2] = ornt[2]%360;
	console.log(ffront+' '+ftop+'orient = '+ ornt);
	return ornt;
}	
/* gets the corner's orientation based on the cube index(in the same order as meshes).
	            ________
               /_4_/_5_/| 
	          /___/___/|| 
            ->| 0 | 1 ||| <-7
	      /   |---|---||/
	     6    |_2_|_3_|/
		 
		       ____
		      | 2Y | <--Faces
		  ____|____|____ ____
		 | 4G | 0O | 1B | 3R |
		 |____|____|____|____|
		      | 5W |
		      |____|
*/
/*rotates cubes on correct axis and then trades angle with cube to counter clockwise
*/
function rotate(face) {
	face = face % 6;
	var temp_ang = new Array(3);
	var v = 0;
	switch(face) {
		case 0://orange
			rotOran();
			break;
		case 1://blue
			rotBlue();
			break;
		case 2://yellow 1 becomes 0
			rotYellow();
			break;
		case 3://red
			rotRed();
			break;
		case 4://green
			rotGreen();
			break;
		case 5://white
			rotWht();
			break;
	}
	for (var y=0;y<8;y++) {
		angles[y] = getOrientation(ornts[y][0],ornts[y][1]);
	}
	console.log('ornts = ' +ornts);
	console.log('angles = '+angles);
	cubeRender();
}
function rotOrz(ffront,ftop) { //o/r
	var ov = new Array(2);
	ov[0] = ffront;
	ov[1] = getRight(ffront,ftop);
	return ov;
}
function rotOrx(ffront,ftop) {//b/g
	var y = ftop + 3;
	var ov = new Array(2);
	y=y%6;
	ov[0] = y;
	ov[1] = ffront;
	return ov;
}
function rotOry(ffront,ftop) {//y/w
	var y = ffront;
	var ov = new Array(2);
	ov[0] = getRight(ffront,ftop);
	ov[1] = ftop;
	return ov;
}

function rotOran() {
	for (var y=0;y<4;y++) {
		
		ornts[y] = rotOrz(ornts[y][0],ornts[y][1]);
	}
	var temp = ornts[1];
	ornts[1] = ornts[3];
	ornts[3] = ornts[2];
	ornts[2] = ornts[0];
	ornts[0] = temp;
	
}
function rotBlue() {
	for (var y=1;y<8;y++) {
		if (y %2 == 1) {
			
			ornts[y]=rotOrx(ornts[y][0],ornts[y][1]);
		}
	}
	var temp = ornts[1];
	ornts[1] = ornts[3];
	ornts[3] = ornts[7];
	ornts[7] = ornts[5];
	ornts[5] = temp;
	
	
}
function rotYellow() {
	for (var y=0;y<6;y++) {
		if (y != 2 && y != 3) {
			
			ornts[y] = rotOry(ornts[y][0],ornts[y][1]);
		}
	}
	var temp = ornts[0];
	ornts[0] = ornts[1];
	ornts[1] = ornts[5];
	ornts[5] = ornts[4];
	ornts[4] = temp;
	
}
function rotRed() {
	for (var y=4;y<8;y++) {
		ornts[y] = rotOrz(ornts[y][0],ornts[y][1]);
		ornts[y] = rotOrz(ornts[y][0],ornts[y][1]);
		ornts[y] = rotOrz(ornts[y][0],ornts[y][1]);
	}
	var temp = ornts[7];
	ornts[7] = ornts[5];
	ornts[5] = ornts[4];
	ornts[4] = ornts[6];
	ornts[6] = temp;
}
function rotGreen() {
	for (var y=0;y<7;y++) {
		if (y%2==0) {
			ornts[y]= rotOrx(ornts[y][0],ornts[y][1]);
			ornts[y]= rotOrx(ornts[y][0],ornts[y][1]);
			ornts[y]= rotOrx(ornts[y][0],ornts[y][1]);
		}
	}
	var temp = ornts[4];
	ornts[4] = ornts[6];
	ornts[6] = ornts[2];
	ornts[2] = ornts[0];
	ornts[0] = temp;
}
function rotWht() {
	for (var y=2;y<8;y++) {
		if (y != 4 && y != 5){
			ornts[y] = rotOry(ornts[y][0],ornts[y][1]);
			ornts[y] = rotOry(ornts[y][0],ornts[y][1]);
			ornts[y] = rotOry(ornts[y][0],ornts[y][1]);
		}
	}
	var temp = ornts[7];
	ornts[7] = ornts[3];
	ornts[3] = ornts[2];
	ornts[2] = ornts[6];
	ornts[6] = temp;
	
}
function rotateX(s) {
    
    var radian =  angles[s][0] * (Math.PI/180.0);
    
    //console.log( 'rotate x = ' + radian );
    
    gl.uniform1f( xang, radian );
    
    angles[s][0]+=10;
    
    if ( angles[s][0] >= 360 ) angles[s][0]-=360;
    
}


function rotateY(s) {
    
    var radian =  angles[s][1] * (Math.PI/180.0);
    
    // console.log( 'rotate y = ' + radian );
    
    gl.uniform1f( yang, radian );
    
    angles[s][1]+=10;
    
    if ( angles[s][1] >= 360 ) angles[s][1]-=360;
    
}

function animate() {
    
    timerID=setInterval( render, 50);
    
}

function rotateZ90(s) {
    
    var radian =  angles[s][2] * (Math.PI/180.0);
    
    console.log( 'rotate 90c' + s );
    
    gl.uniform1f( zang, radian );
    
    angles[s][2]+=90;
    
    if ( angles[s][2] >= 360 ) angles[s][2]-=360;
    
}
function rotateZ(s) {
    
    var radian =  angles[s][2] * (Math.PI/180.0);
    
    console.log( 'rotate c' + s );
    
    gl.uniform1f( zang, radian );
    
    //angles[s][2]+=90;
    
    if ( angles[s][2] >= 360 ) angles[s][2]-=360;
    
}

//will take arg for face
function rotX() {
          
    var select = document.getElementById('rotx');
    var ang_deg = select.options[select.selectedIndex].value; 
    
    var radian =  ang_deg * (Math.PI/180.0);
    
    console.log( 'rotate x = ' + radian );
    
    gl.uniform1f( xang, radian );
    
    render();
    
}


function rotY() {
    
    var select = document.getElementById('roty');
    var ang_deg = select.options[select.selectedIndex].value; 
    
    var radian =  ang_deg * (Math.PI/180.0);
    
    console.log( 'rotate y = ' + radian );
    
    gl.uniform1f( yang, radian );
    
    render();//cubeRender();
    
}

function rotZ() {
    
    var select = document.getElementById('rotz');
    var ang_deg = select.options[select.selectedIndex].value; 
    
    var radian =  ang_deg * (Math.PI/180.0);
    
    console.log( 'rotate z = ' + radian );
    
    gl.uniform1f( zang, radian );
    render();
    //cubeRender();
    
}

function scale() {
    
    var select = document.getElementById('scale');
    var s_val = select.options[select.selectedIndex].value;
    
    console.log( 'scale = ' + s_val );
    
    gl.uniform1f( sx, s_val );
    
    cubeRender();
    
}

var SquareInitialPosition = new Array();


function createMesh(s) {
    SquareInitialPosition[s] = new Array();
	var sx = -1.1;// = 1.0 * s-5;
	var sy = 1.1;
	var sz = -2.2;
	
	if( s%2 == 1) sx = 1.1; //right side
	if (s % 4 > 1) sy = -1.1; // bottom
	if( s >= 4) {sz = 2.2;sy += 2.2;sx += 2.2; if (s%2==0)sx+=4.4;} // back
	
	var rx = sx;//randomRange((-1+SCALE)/SCALE,(1-SCALE)/SCALE);
	var ry = sy;//randomRange((-1+SCALE)/SCALE,(1-SCALE)/SCALE);
	var rz = sz;//randomRange((-1+SCALE)/SCALE,(1-SCALE)/SCALE);
	SquareInitialPosition[s][0] = rx;
	SquareInitialPosition[s][1] = ry;
	SquareInitialPosition[s][2] = rz;
    for ( var i=0; i<F.length; i++ ) {
        
		var v = new Array();
         v[0] = V[ F[i][0] ];
         v[1] = V[ F[i][1] ];
         v[2] = V[ F[i][2] ];
        
		for(var j=0;j<3;j++){
			mesh.push(v[j][0]);
			mesh.push(v[j][1]);
			mesh.push(v[j][2]);
		}

        
    }
    
}


function createColors() {
    
    var cnt=0;
    
    for ( var i=0; i<Math.abs(F.length/4*NUMBER_SQUARES); i++ ) {
        
        if ( i%3===0 ) {
            
            for ( var j=0; j<6; j++) color[cnt++]=vec4(1.0, 0.0, 0.0, 1.0);//r<->face 3
			for ( var j=0; j<6; j++) color[cnt++]=vec4(1.0, 0.5, 0.0, 1.0);//o<->face 0
            
        } else if ( i%3===1 ) {
            
            for ( var j=0; j<6; j++) color[cnt++]=vec4(1.0, 1.0, 0.0, 1.0);//y<-> face 2
			for ( var j=0; j<6; j++) color[cnt++]=vec4(1.0, 1.0, 1.0, 1.0);//w<-> face 5
            
        } else {
            
            for ( var j=0; j<6; j++) color[cnt++]=vec4(0.0, 0.0, 1.0, 1.0);//b<-> face 1
			for ( var j=0; j<6; j++) color[cnt++]=vec4(0.0, 1.0, 0.0, 1.0);//g<->face 4
        }
        
    }
    
}

function bufferData() {
    
    var bufferId = gl.createBuffer();
    var colorId = gl.createBuffer();
    var faceId = gl.createBuffer();
    
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
        
    gl.bufferData( gl.ARRAY_BUFFER, flatten(mesh), gl.STATIC_DRAW );
    
    gl.bindBuffer(gl.ARRAY_BUFFER, colorId);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor ); 
    
    gl.bufferData( gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW );
    
}

function render() {
    
	for( var y = 0;y<NUMBER_SQUARES;y++){
		gl.uniform4f( cm, SquareInitialPosition[y][0], SquareInitialPosition[y][1], SquareInitialPosition[y][2], 0.0 );  
		for ( var i=F.length*3*y; i<F.length*3+F.length*3*y; i+=3){
			gl.drawArrays( gl.TRIANGLES, i, 3 );
		} 
    
		//rotateX(y);
		//rotateY(y);
		//rotateZ(y);
    }
	

       
        

}
function cubeRender(face) {
	console.log('Render');
	for( var y = 0;y<NUMBER_SQUARES;y++){
		console.log('c'+y+' ang = '+angles[y]);
		var temp = angles[y];
		if (y >= 4) temp[1]+=180;
		var radianx = ((temp[0]+340)%360) * (Math.PI/180.0);
		var radiany = ((temp[1]+20)%360) * (Math.PI/180.0);
		var radianz = temp[2] * (Math.PI/180.0);
		
		gl.uniform1f(xang,radianx);
		gl.uniform1f(yang,radiany);
		gl.uniform1f(zang,radianz);
		
		gl.uniform4f( cm, SquareInitialPosition[y][0], SquareInitialPosition[y][1], SquareInitialPosition[y][2], 0.0 );  
		for ( var i=F.length*3*y; i<F.length*3+F.length*3*y; i+=3){
			gl.drawArrays( gl.TRIANGLES, i, 3 );
		} 
    }
	console.log('end Render');
	
}

function orender(min,max) {
    if (min < 0 || min >= NUMBER_SQUARES-1) min = 0;
	if (max < 1 || max >= NUMBER_SQUARES) max = min+1;//can be 8 overflow
	
	for( var y = 0; y<min;y++){
		console.log('pre');
		gl.uniform4f( cm, SquareInitialPosition[y][0], SquareInitialPosition[y][1], SquareInitialPosition[y][2], 0.0 );
		
		for ( var i=F.length*3*y; i<F.length*3+F.length*3*y; i+=3){
			gl.drawArrays( gl.TRIANGLES, i, 3 );
		} 
    }
	
	for( var y = min; y<=max;y++){
		var radian =  Math.PI;
		gl.uniform1f( zang, radian );
		gl.uniform4f( cm, SquareInitialPosition[y][0], SquareInitialPosition[y][1], SquareInitialPosition[y][2], 0.0 );
    }
	
	for( var y = max+1; y<NUMBER_SQUARES;y++){
		console.log('post');
		var radian = Math.PI;
		gl.uniform1f(zang, radian);
		//rotateZ(y);
		gl.uniform4f( cm, SquareInitialPosition[y][0], SquareInitialPosition[y][1], SquareInitialPosition[y][2], 0.0 );
		
		for ( var i=F.length*3*y; i<F.length*3+F.length*3*y; i+=3){
			gl.drawArrays( gl.TRIANGLES, i, 3 );
		} 
    }
	

    console.log(angles);
        //render();

}

function randomRange(min,max) {
    return Math.random() * (max-min) + min;
}

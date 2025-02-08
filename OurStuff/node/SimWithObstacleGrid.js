let CPM = require("../../build/artistoo-cjs.js")


/*	----------------------------------
	CONFIGURATION SETTINGS
	----------------------------------
*/
let config = {

	// Grid settings
	ndim : 2,
	field_size : [250,250],
	
	// CPM parameters and configuration
	conf : {
		// Basic CPM parameters
		torus : [true,true],						// Should the grid have linked borders?
		T : 20,								// CPM temperature
		
		// Constraint parameters. 
		// Mostly these have the format of an array in which each element specifies the
		// parameter value for one of the cellkinds on the grid.
		// First value is always cellkind 0 (the background) and is often not used.
				
		// Adhesion parameters:
		J: [[0,20], [0,0]],
		
		// VolumeConstraint parameters
		LAMBDA_V: [0,50],					// VolumeConstraint importance per cellkind
		V: [0,200],							// Target volume of each cellkind
		
		// PerimeterConstraint parameters
		LAMBDA_P: [0,2],						// PerimeterConstraint importance per cellkind
		P : [0,180],						// Target perimeter of each cellkind
		
		// ActivityConstraint parameters
		LAMBDA_ACT : [0,200],				// ActivityConstraint importance per cellkind
		MAX_ACT : [0,80],					// Activity memory duration per cellkind
		ACT_MEAN : "geometric"				// Is neighborhood activity computed as a
											// "geometric" or "arithmetic" mean?

	},
	
	// Simulation setup and configuration
	simsettings : {
	
		// Cells on the grid
		NRCELLS : [0],
											// non-background cellkinds.
		// Runtime etc
		BURNIN : 100,
		RUNTIME : 15001,
		RUNTIME_BROWSER : "Inf",
		
		// Visualization
		CANVASCOLOR : "eaecef",
		CELLCOLOR : ["000000"],
		ACTCOLOR : [true],					// Should pixel activity values be displayed?
		SHOWBORDERS : [false],				// Should cellborders be displayed?
		zoom : 2,							// zoom in on canvas with this factor.
		
		// Output images
		SAVEIMG : true,					// Should a png image of the grid be saved
											// during the simulation?
		IMGFRAMERATE : 5,					// If so, do this every <IMGFRAMERATE> MCS.
		SAVEPATH : "output/img/ObstacleModel6",	// ... And save the image in this folder.
		EXPNAME : "ObstacleModel",					// Used for the filename of output images.be saved
											// during the simulation?
		
		// Output stats etc
		STATSOUT : { browser: false, node: true }, // Should stats be computed?
		LOGRATE : 10							// Output stats every <LOGRATE> MCS.

	}
}
/*	---------------------------------- */

function initialize(){
	let custommethods = {
			initializeGrid : initializeGrid,
			buildChannel : buildChannel,
			drawBelow : drawBelow
		 }

	sim = new CPM.Simulation( config, custommethods )
	// sim.Cim = new CPM.Canvas( sim.C, {
	// 	zoom:sim.conf.zoom, 
	// 	parentElement : document.getElementById("sim")
	// } )
	// sim.helpClasses[ "canvas" ] = true
	// step()
	sim.run()
}

function drawBelow(){
	this.Cim.drawPixelSet( this.channelvoxels, "0000FF" ) 
}

function initializeGrid(){
	
	// add the initializer if not already there
	if( !this.helpClasses["gm"] ){ this.addGridManipulator() }
	this.buildChannel()

	//this.gm.seedCellAt( 1, [50,50] )
	//this.gm.seedCellAt( 1, [100,100] )

	
	for (let i = 0; i < 300; i++) {
		let x, y, isInsideObstacle;

		do {
			x = Math.floor(Math.random() * this.C.extents[0]); // Adjust 500 to the appropriate grid width
			y = Math.floor(Math.random() * this.C.extents[1]); // Adjust 500 to the appropriate grid height
			isInsideObstacle = this.channelvoxels.some(v => v[0] === x && v[1] === y);
		} while (isInsideObstacle)
		
		this.gm.seedCellAt(1, [x, y]);
	}

}
	
function buildChannel(){
		
	
	this.channelvoxels = []
	let obstacle_grid = 9
	
	const xOffset = 30, yOffset = 30
	const dx = Math.floor( this.C.extents[0]/obstacle_grid ), dy = Math.floor( this.C.extents[1]/obstacle_grid )
	const radius = 5 
	
	for( let x = xOffset; x < this.C.extents[0]; x+= dx ){
		for( let y = yOffset; y < this.C.extents[1]; y+= dy ){
			const center = [x,y]
			
			for( let xx = center[0]-radius; xx <= center[0]+radius; xx++ ){
				for( let yy = center[1]-radius; yy <= center[1]+radius; yy++){
					let dx = Math.abs( xx-center[0] ), dy = Math.abs( yy-center[1] )
					if( Math.sqrt( dx*dx + dy*dy ) < radius ){
						this.channelvoxels.push( [xx,yy] )
					}	
				}
			}
			
		}
	}
	
	
	
	this.C.add( new CPM.BorderConstraint({
		BARRIER_VOXELS : this.channelvoxels
	}) )
	
}



initialize()

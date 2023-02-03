class Confetti {

  constructor( game ) {

    this.game = game;
    this.started = 0;

    this.options = {
      speed: { min: 0.0011, max: 0.0022 },
      revolution: { min: 0.01, max: 0.05 },
      size: { min: 0.1, max: 0.15 },
      colors: [ 0x41aac8, 0x82ca38, 0xffef48, 0xef3923, 0xff8c0a ],
    };

    this.geometry = new THREE.PlaneGeometry( 1, 1 );
    this.material = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide } );

    this.holders = [
      new ConfettiStage( this.game, this, 1, 20 ),
      new ConfettiStage( this.game, this, -1, 30 ),
    ];

  }

  start() {

    if ( this.started > 0 ) return;

    this.holders.forEach( holder => {

      this.game.world.scene.add( holder.holder );
      holder.start();
      this.started ++;

    } );

  }

  stop() {

    if ( this.started == 0 ) return;

    this.holders.forEach( holder => {

      holder.stop( () => {

        this.game.world.scene.remove( holder.holder );
        this.started --;

      } );

    } );

  }

  updateColors( colors ) {

    this.holders.forEach( holder => {

      holder.options.colors.forEach( ( color, index ) => {

        holder.options.colors[ index ] = colors[ [ 'D', 'F', 'R', 'B', 'L' ][ index ] ];

      } );

    } );

  }

}

class ConfettiStage extends Animation {

  constructor( game, parent, distance, count ) {

    super( false );

    this.game = game;
    this.parent = parent;

    this.distanceFromCube = distance;

    this.count = count;
    this.particles = [];

    this.holder = new THREE.Object3D();
    this.holder.rotation.copy( this.game.world.camera.rotation );

    this.object = new THREE.Object3D();
    this.holder.add( this.object );

    this.resizeViewport = this.resizeViewport.bind( this );
    this.game.world.onResize.push( this.resizeViewport );
    this.resizeViewport();    

    this.geometry = this.parent.geometry;
    this.material = this.parent.material;

    this.options = this.parent.options;

    let i = this.count;
    while ( i-- ) this.particles.push( new Particle( this ) );

  }

  start() {

    this.time = performance.now();
    this.playing = true;

    let i = this.count;
    while ( i-- ) this.particles[ i ].reset();

    super.start();

  }

  stop( callback ) {

    this.playing = false;
    this.completed = 0;
    this.callback = callback;

  }

  reset() {

    super.stop();

    this.callback();

  }

  update() {

    const now = performance.now();
    const delta = now - this.time;
    this.time = now;

    let i = this.count;

    while ( i-- )
      if ( ! this.particles[ i ].completed ) this.particles[ i ].update( delta );

    if ( ! this.playing && this.completed == this.count ) this.reset();

  }

  resizeViewport() {

    const fovRad = this.game.world.camera.fov * THREE.Math.DEG2RAD;

    this.height = 2 * Math.tan( fovRad / 2 ) * ( this.game.world.camera.position.length() - this.distanceFromCube );
    this.width = this.height * this.game.world.camera.aspect;

    const scale = 1 / this.game.transition.data.cameraZoom;

    this.width *= scale;
    this.height *= scale;

    this.object.position.z = this.distanceFromCube;
    this.object.position.y = this.height / 2;

  }
  
}
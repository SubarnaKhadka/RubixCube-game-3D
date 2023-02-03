class Animation {

  constructor( start ) {

    if ( start === true ) this.start();

  }

  start() {

    animationEngine.add( this );

  }

  stop() {

    animationEngine.remove( this );

  }

  update( delta ) {}

}
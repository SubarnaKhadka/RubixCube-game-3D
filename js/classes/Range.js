class Range {

  constructor( name, options ) {

    options = Object.assign( {
      range: [ 0, 1 ],
      value: 0,
      step: 0,
      onUpdate: () => {},
      onComplete: () => {},
    }, options || {} );

    this.element = document.querySelector( '.range[name="' + name + '"]' );
    this.track = this.element.querySelector( '.range__track' );
    this.handle = this.element.querySelector( '.range__handle' );
    this.list = [].slice.call( this.element.querySelectorAll( '.range__list div' ) );

    this.value = options.value;
    this.min = options.range[0];
    this.max = options.range[1];
    this.step = options.step;

    this.onUpdate = options.onUpdate;
    this.onComplete = options.onComplete;

    this.setValue( this.value );

    this.initDraggable();

  }

  setValue( value ) {

    this.value = this.round( this.limitValue( value ) );
    this.setHandlePosition();

  }

  initDraggable() {

    let current;

    this.draggable = new Draggable( this.handle, { calcDelta: true } );

    this.draggable.onDragStart = position => {

      current = this.positionFromValue( this.value );
      this.handle.style.left = current + 'px';

    };

    this.draggable.onDragMove = position => {

      current = this.limitPosition( current + position.delta.x );
      this.value = this.round( this.valueFromPosition( current ) );
      this.setHandlePosition();
      
      this.onUpdate( this.value );

    };

    this.draggable.onDragEnd = position => {

      this.onComplete( this.value );

    };

  }

  round( value ) {

    if ( this.step < 1 ) return value;

    return Math.round( ( value - this.min ) / this.step ) * this.step + this.min;

  }

  limitValue( value ) {

    const max = Math.max( this.max, this.min );
    const min = Math.min( this.max, this.min );

    return Math.min( Math.max( value, min ), max );

  }

  limitPosition( position ) {

    return Math.min( Math.max( position, 0 ), this.track.offsetWidth );

  }

  percentsFromValue( value ) {

    return ( value - this.min ) / ( this.max - this.min );

  }

  valueFromPosition( position ) {

    return this.min + ( this.max - this.min ) * ( position / this.track.offsetWidth );

  }

  positionFromValue( value ) {

    return this.percentsFromValue( value ) * this.track.offsetWidth;

  }

  setHandlePosition() {

    this.handle.style.left = this.percentsFromValue( this.value ) * 100 + '%';

  }

}
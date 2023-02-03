class Themes {

  constructor( game ) {

    this.game = game;
    this.theme = null;

    this.defaults = {
      cube: {
        U: 0xfff7ff, // white
        D: 0xffef48, // yellow
        F: 0xef3923, // red
        R: 0x41aac8, // blue
        B: 0xff8c0a, // orange
        L: 0x82ca38, // green
        P: 0x08101a, // piece
        G: 0xd1d5db, // background
      },
      erno: {
        U: 0xffffff,
        D: 0xffd500,
        F: 0xc41e3a,
        R: 0x0051ba,
        B: 0xff5800,
        L: 0x009e60,
        P: 0x08101a,
        G: 0x8abdff,
      },
      dust: {
        U: 0xfff6eb,
        D: 0xe7c48d,
        F: 0x8f253e,
        R: 0x607e69,
        B: 0xbe6f62,
        L: 0x849f5d,
        P: 0x08101a,
        G: 0xE7C48D,
      },
      camo: {
        U: 0xfff6eb,
        D: 0xbfb672,
        F: 0x37241c,
        R: 0x718456,
        B: 0x805831,
        L: 0x37431d,
        P: 0x08101a,
        G: 0xBFB672,
      },
      rain: {
        U: 0xfafaff,
        D: 0xedb92d,
        F: 0xce2135,
        R: 0x449a89,
        B: 0xec582f,
        L: 0xa3a947,
        P: 0x08101a,
        G: 0x87b9ac,
      },
    };

    this.colors = JSON.parse( JSON.stringify( this.defaults ) );

  }

  getColors() {

    return this.colors[ this.theme ];

  }

  setTheme( theme = false, force = false ) {

    if ( theme === this.theme && force === false ) return;
    if ( theme !== false ) this.theme = theme;

    const colors = this.getColors();

    this.game.dom.prefs.querySelectorAll( '.range__handle div' ).forEach( range => {

      range.style.background = '#' + colors.R.toString(16).padStart(6, '0');

    } );

    this.game.cube.updateColors( colors );

    this.game.confetti.updateColors( colors );

    this.game.dom.back.style.background = '#' + colors.G.toString(16).padStart(6, '0');

  }

}

class ThemeEditor {

  constructor( game ) {

    this.game = game;

    this.editColor = 'R';

    this.getPieceColor = this.getPieceColor.bind( this );

  }

  colorFromHSL( h, s, l ) {

    h = Math.round( h );
    s = Math.round( s );
    l = Math.round( l );

    return new THREE.Color( `hsl(${h}, ${s}%, ${l}%)` );

  }

  setHSL( color = null, animate = false ) {

    this.editColor = ( color === null) ? 'R' : color;

    const hsl = new THREE.Color( this.game.themes.getColors()[ this.editColor ] );

    const { h, s, l } = hsl.getHSL( hsl );
    const { hue, saturation, lightness } = this.game.preferences.ranges;

    if ( animate ) {

      const ho = hue.value / 360;
      const so = saturation.value / 100;
      const lo = lightness.value / 100;

      const colorOld = this.colorFromHSL( hue.value, saturation.value, lightness.value );

      if ( this.tweenHSL ) this.tweenHSL.stop();

      this.tweenHSL = new Tween( {
        duration: 200,
        easing: Easing.Sine.Out(),
        onUpdate: tween => {

          hue.setValue( ( ho + ( h - ho ) * tween.value ) * 360 );
          saturation.setValue( ( so + ( s - so ) * tween.value ) * 100 );
          lightness.setValue( ( lo + ( l - lo ) * tween.value ) * 100 );

          const colorTween = colorOld.clone().lerp( hsl, tween.value );

          const colorTweenStyle = colorTween.getStyle();
          const colorTweenHex = colorTween.getHSL( colorTween );

          hue.handle.style.color = colorTweenStyle;
          saturation.handle.style.color = colorTweenStyle;
          lightness.handle.style.color = colorTweenStyle;

          saturation.track.style.color =
            this.colorFromHSL( colorTweenHex.h * 360, 100, 50 ).getStyle();
          lightness.track.style.color =
            this.colorFromHSL( colorTweenHex.h * 360, colorTweenHex.s * 100, 50 ).getStyle();

          this.game.dom.theme.style.display = 'none';
          this.game.dom.theme.offsetHeight;
          this.game.dom.theme.style.display = '';

        },
        onComplete: () => {

          this.updateHSL();
          this.game.storage.savePreferences();

        },
      } );

    } else {

      hue.setValue( h * 360 );
      saturation.setValue( s * 100 );
      lightness.setValue( l * 100 );

      this.updateHSL();
      this.game.storage.savePreferences();

    }

  }

  updateHSL() {

    const { hue, saturation, lightness } = this.game.preferences.ranges;

    const h = hue.value;
    const s = saturation.value;
    const l = lightness.value;

    const color = this.colorFromHSL( h, s, l ).getStyle();

    hue.handle.style.color = color;
    saturation.handle.style.color = color;
    lightness.handle.style.color = color;

    saturation.track.style.color = this.colorFromHSL( h, 100, 50 ).getStyle();
    lightness.track.style.color = this.colorFromHSL( h, s, 50 ).getStyle();

    this.game.dom.theme.style.display = 'none';
    this.game.dom.theme.offsetHeight;
    this.game.dom.theme.style.display = '';

    const theme = this.game.themes.theme;

    this.game.themes.colors[ theme ][ this.editColor ] = this.colorFromHSL( h, s, l ).getHex();
    this.game.themes.setTheme();

  }

  colorPicker( enable ) {

    if ( enable ) {

      this.game.dom.game.addEventListener( 'click', this.getPieceColor, false );

    } else {

      this.game.dom.game.removeEventListener( 'click', this.getPieceColor, false );

    }

  }

  getPieceColor( event ) {

    const clickEvent = event.touches
      ? ( event.touches[ 0 ] || event.changedTouches[ 0 ] )
      : event;

    const clickPosition = new THREE.Vector2( clickEvent.pageX, clickEvent.pageY );

    let edgeIntersect = this.game.controls.getIntersect( clickPosition, this.game.cube.edges, true );
    let pieceIntersect = this.game.controls.getIntersect( clickPosition, this.game.cube.cubes, true );

    if ( edgeIntersect !== false ) {

      const edge = edgeIntersect.object;

      const position = edge.parent
        .localToWorld( edge.position.clone() )
        .sub( this.game.cube.object.position )
        .sub( this.game.cube.animator.position );

      const mainAxis = this.game.controls.getMainAxis( position );
      if ( position.multiplyScalar( 2 ).round()[ mainAxis ] < 1 ) edgeIntersect = false;

    }

    const name = edgeIntersect ? edgeIntersect.object.name : pieceIntersect ? 'P' : 'G';

    this.setHSL( name, true );

  }

  resetTheme() {

    this.game.themes.colors[ this.game.themes.theme ] =
      JSON.parse( JSON.stringify( this.game.themes.defaults[ this.game.themes.theme ] ) );

    this.game.themes.setTheme();

    this.setHSL( this.editColor, true );

  }

}
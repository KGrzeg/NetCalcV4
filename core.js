/**************************************************
* 
*             ~ Copyright (c) Grzesiu ~
*  	 ~ Ostatecznie trochę się napracowałem.			 ~
* 	 ~ Chciałbym, aby moja praca była uszanowana. ~
* 
**************************************************/

String.prototype.insertAt = function( index, string ) {
	return this.substr( 0, index ) + string + this.substr( index );
};
String.prototype.countChar = function( p ) {
	return this.split( p ).length - 1;
};
if( !Object.isEmpty ) {
	Object.isEmpty = function( obj ) {
		for( var prop in obj ) {
			if( obj.hasOwnProperty( prop ) )
				return false;
		}
		return false;
	}
}

var g_disco = false;
var g_interval = 0;
var g_info = false;
var g_mainIP;

var IPv4 = function( ip, mask ) {
	this.ip = [];
	this.mask = [];
	this.nmask = [];
	this.masklen = 0;
	this.net = [];
	this.hostrange = [];
	this.baseband = [];
	this.ipclass = "blanc";

	//podzial na podsieci
	this.subsnum = 0;
	this.subs = [];
	this.submask = [];

	//konstruktor
	if( !this.setIP( ip ) )
		return false;
	if( mask )
		this.setMask( mask );

	//nie udało się określić maski
	if( this.masklen == 0 )
		alert( "Nie udało się określić maski na podstawie adresu IP!" );
}
IPv4.prototype.setIP = function( str ) {
	var patt = new RegExp( "^([0-9]{1,3}\\.){3}[0-9]{1,3}$" );
	if( !patt.test( str ) ) {
		alert( "Błędne IP!" );
		return;
	}
	ip = str.split( "." );
	for( var n = 0; n < 4; ++n ) {
		if( ip[n] < 0 || ip[n] > 255 ) {
			alert( "Błędne IP!" );
			return false;
		}
		ip[n] = Number( ip[n] );
	}
	this.ip = ip;
	this.calcClass();
	if( this.masklen != 0 ) {
		this.calcBaseband();
		this.calcNet();
		this.calcRange();
	}
	return true;
};
IPv4.prototype.setMask = function( str ) {
	var patt = new RegExp( "^([0-9]{1,3}\\.){3}[0-9]{1,3}$" );
	if( !patt.test( str ) ) {
		alert( "Błędna maska!" );
		return false;
	}
	var mask = str.split( "." );
	var nmask = [];
	var lastmask = 255;
	for( var i = 0; i < 4; ++i ) {
		if( mask[i] < 0 || mask[i] > 255 ) {
			alert( "Błędna maska!" );
			return false;
		}
		if( lastmask < mask[i] ) {
			alert( "Błędna maska!" );
			return false;
		}
		if( lastmask < 255 && mask[i] > 0 ) {
			alert( "Błędna maska!" );
			return false;
		}
		if( mask[i] != 255 &&
									mask[i] != 254 &&
									mask[i] != 252 &&
									mask[i] != 240 &&
									mask[i] != 248 &&
									mask[i] != 224 &&
									mask[i] != 192 &&
									mask[i] != 128 &&
									mask[i] != 0 ) {
			alert( "Błędna maska!" );
			return false;
		}
		mask[i] = Number( mask[i] );
		nmask[i] = mask[i] ^ 255;
		lastmask = mask[i];
	}
	//ilość jedynek w masce (długość maski)
	var masklen = "";
	for( var i = 0; i < 4; ++i )
		masklen += mask[i].toString( 2 );
	masklen = masklen.countChar( "1" );

	if( masklen > 31 ) {
		alert( "Maska jest za długa!" )
		return false;
	}

	this.mask = mask;
	this.nmask = mask;
	this.masklen = masklen;
	this.calcClass();
	this.calcBaseband();
	this.calcNet();
	this.calcRange();
	return true;
};
IPv4.prototype.calcClass = function() {
	if( this.ip.length == 0 ) {
		alert( "Nie ustawiono jeszcze adresu IP" );
		return false;
	}
	var netclass = null;
	var test = this.ip[0];
	var masklen = this.masklen;
	if( ( 0 <= test && test <= 127 ) ) {
		if( masklen == 0 ) {
			this.masklen = 8;
			this.mask = [255, 0, 0, 0];
			this.nmask = [0, 255, 255, 255];
		}
		if( this.masklen == 8 ) {
			this.ipclass = "A";
		} else {
			this.ipclass = "A (niestandardowa maska)";
		}
		return true;
	}
	if( ( 128 <= test && test <= 191 ) ) {
		if( masklen == 0 ) {
			this.masklen = 16;
			this.mask = [255, 255, 0, 0];
			this.nmask = [0, 0, 255, 255];
		}
		if( this.masklen == 16 ) {
			this.ipclass = "B";
		} else {
			this.ipclass = "B (niestandardowa maska)";
		}
		return true;
	}
	if( ( 192 <= test && test <= 223 ) ) {
		if( masklen == 0 ) {
			this.masklen = 24;
			this.mask = [255, 255, 255, 0];
			this.nmask = [0, 0, 0, 255];
		}
		if( this.masklen == 24 ) {
			this.ipclass = "C";
		} else {
			this.ipclass = "C (niestandardowa maska)";
		}
		return true;
	}
	if( ( 224 <= test && test <= 239 ) ) {
		this.ipclass = "D";
		return true;
	}
	if( ( 240 <= test && test <= 255 ) ) {
		this.ipclass = "E";
		return true;
	}
	this.ipclass = "Bezklasowy";
	return true;
};
IPv4.prototype.calcBaseband = function() {
	if( this.ip.length == 0 ) {
		alert( "Nie wprowadzono IP" );
		return false;
	} else {
		if( this.masklen == 0 ) {
			alert( "Nie określono maski" );
			return false;
		} else {
			for( var i = 0; i < 4; ++i )
				this.baseband[i] = this.ip[i] | this.mask[i] ^ 255;
		}
	}
	return true;
};
IPv4.prototype.calcNet = function() {
	if( this.ip.length == 0 ) {
		alert( "Nie wprowadzono IP" );
		return false;
	} else {
		if( this.masklen == 0 ) {
			alert( "Nie określono maski" );
			return false;
		} else {
			for( var i = 0; i < 4; ++i )
				this.net[i] = this.ip[i] & this.mask[i];
		}
	}
	return true;
};
IPv4.prototype.calcRange = function() {
	if( this.ip.length == 0 ) {
		alert( "Nie wprowadzono IP" );
		return false;
	} else {
		if( this.masklen == 0 ) {
			alert( "Nie określono maski" );
			return false;
		} else {
			if( this.net.length == 0 ) if( !this.calcNet() ) return false;
			if( this.baseband.length == 0 ) if( !this.calcBaseband() ) return false;
			this.hostrange[0] = numToIp( ipToNum( this.net ) + 1 );
			this.hostrange[1] = numToIp( ipToNum( this.baseband ) - 1 );
		}
	}
	return true;
};
IPv4.prototype.setSubs = function( number ) {
	if( number <= 1 ) {
		alert( "Za mała ilość podsieci!" );
		return false;
	}

	var bits = 0;
	while( number > Math.pow(2, bits) )
		++bits;
	if( this.masklen + bits >= 32 ) {
		alert( "Za duża ilość podsieci!" );
		return false;
	}

	this.subsnum = number;
	this.submask = numToMask(this.masklen + bits);

	this.subs = [];
	for( var i = 0; i < number; ++i ) {
		//obliczanie adresu sieci kolejnej podsieci
		var ip = ipToNum( this.net );
		var temp = ( i << ( 32 - this.masklen - bits ) ) >>> 0;
		ip |= temp;
		ip = ip >>> 0;

		//dodaj nowe IP
		this.subs.push( new IPv4( ipToString10( numToIp(ip) ), ipToString10(this.submask) ) );
	}
	//odwróć kolejność podsieci
	//this.subs.reverse();
	return true;
}

function toBin8( num ) {
	var ret = num.toString( 2 );
	while( ret.length < 8 )
		ret = "0" + ret;
	return ret;
}
function numToMask( num ) {
	var mask = [];
	var rawmask = "";
	for( var i = 0; i < num; ++i )
		rawmask += "1";
	for( var i = rawmask.length; i < 32; ++i )
		rawmask += "0";
	for( var n = 0; n < 4; ++n )
		mask[n] = parseInt( rawmask.substr( n * 8, 8 ), 2 );
	return mask;
}
function numToIp( num ) {
	if( num > 4294967295 || num < 0 )
		return;
	var mask = 0xff000000;
	var ip = [];
	for( var i = 0; i < 4; ++i ) {
		ip[i] = ( num & mask ) >>> ( 24 - i * 8 );
		mask = mask >>> 8;
	}
	return ip;
}
function ipToNum( araj ) {
	if( araj.length != 4 )
		return;
	var str = "";
	for( var i = 0; i < 4; ++i ) {
		var temp = araj[i].toString( 2 );
		while( temp.length < 8 )
			temp = "0" + temp;
		str += temp;
	}
	return parseInt( str, 2 );
}
function wyrownaj10( araj ) {
	var out = "";
	for( var n = 0; n < araj.length; ++n ) {
		if( n != 0 ) {
			out += ".";
		}

		if( araj[n] > 99 )
			out += "   " + araj[n].toString() + "  ";
		else if( araj[n] > 9 )
			out += "    " + araj[n].toString() + "  ";
		else
			out += "     " + araj[n].toString() + "  ";
	}
	return out;
}
function wyrownaj2( araj ) {
	var out = "";
	for( var n = 0; n < araj.length; ++n ) {
		if( n != 0 ) {
			out += ".";
		}
		var temp = araj[n].toString( 2 );
		while( temp.length < 8 )
			temp = "0" + temp;
		out += temp;
		temp = araj[n].toString( 2 );
	}
	return out;
}
function ipToString10( araj ) {
	if( araj.length != 4 )
		return;
	var str = "";
	for( var i = 0; i < 4; ++i ) {
		if( i != 0 )
			str += ".";
		str += araj[i].toString();
	}
	return str;
}
function ipToString2( araj ) {
	if( araj.length != 4 )
		return;
	var str = "";
	for( var i = 0; i < 4; ++i ) {
		if( i != 0 )
			str += ".";
		var temp = araj[i].toString( 2 );
		while( temp.length < 8 )
			temp = "0" + temp;
		str += temp;
	}
	return str;
}

function licz1() {
	var elemip = document.getElementById( "ip" );
	var elemmask = document.getElementById( "mask" );

	if( elemip.value == "" ) {
		alert( "Nie wpisano IP!" )
		return false;
	}
	var strip = elemip.value.replace( /,/g, "." ).replace( / /g, "." ).replace( /\t/g, "." );
	var strmask = "";
	if( elemmask.value == "" ) {
		g_mainIP = new IPv4( strip, false );
		if( g_mainIP.masklen == 0 )
			return false;
	} else {
		strmask = elemmask.value.replace( /,/g, "." ).replace( / /g, "." ).replace( /\t/g, "." );
		g_mainIP = new IPv4( strip, strmask );
		if( g_mainIP.masklen == 0 )
			return false;
	}
	elemip.value = strip;
	if( strmask != "" )
		elemmask.value = strmask;
	print( g_mainIP );
};
function licz2() {
	var strip = document.getElementById( "ipm" ).value.replace( '\\', '/' ).replace( /,/g, "." ).replace( / /g, "." ).replace( /\t/g, "." );

	var patt = new RegExp( "^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$" );
	if( !patt.test( strip ) ) {
		alert( "Błędny format!" );
		return;
	}

	document.getElementById( "ipm" ).value = strip;

	var nummask = Number( strip.split( "/" )[1] );
	strip = strip.substr( 0, strip.length - ( nummask > 9 ? 3 : 2 ) );
	
	g_mainIP = new IPv4( strip, ipToString10( numToMask( nummask ) ) );

	print( g_mainIP );
};
function subs() {
	if( Object.isEmpty( g_mainIP ) ) {
		alert( "Nie stworzono jeszcze IP do podziału!" );
		return false;
	}

	var num = parseInt( document.getElementById( "subs" ).value );
	if( g_mainIP.setSubs( num ) )
		printSubnets( g_mainIP );
	return true;
}

function print( IP ) {
	var table = document.createElement( "table" );
	table.className = "dataset";

	function rowDec( title, array ) {
		var row = document.createElement( "tr" );
		var cell = document.createElement( "th" );
		cell.className = "left";
		cell.textContent = title;
		row.appendChild( cell );

		for( var i = 0; i < 4; ++i ) {
			var cell = document.createElement( "td" );
			cell.textContent = array[i].toString();
			row.appendChild( cell );
		}
		return row;
	}
	function rowBin( title, array, masklen ) {
		var row = document.createElement( "tr" );
		var cell = document.createElement( "th" );
		cell.className = "left";
		cell.textContent = title;
		row.appendChild( cell );

		for( var i = 0; i < 4; ++i ) {
			var cell = document.createElement( "td" );

			var str = toBin8( array[i] );
			if( masklen > i * 8 && masklen < ( i + 1 ) * 8 )
				str = str.insertAt( masklen % 8, "</span><span class=\"notmask\">" )
			if( masklen > i * 8 )
				str = "<span class=\"mask\">" + str;
			else
				str = "<span class=\"notmask\">" + str;
			str += "</span>";
			cell.innerHTML = str;

			row.appendChild( cell );
		}
		return row;
	}
	function rowSpace() {
		var row = document.createElement( "tr" );
		var cell = document.createElement( "td" );
		row.className = "space";
		row.appendChild( cell );

		var cell = document.createElement( "td" );
		cell.colSpan = 4;
		//cell.innerHTML = "&bull; &bull; &bull;";

		row.appendChild( cell );
		return row;
	}

	/*	klasa adresu */
	var row = document.createElement( "tr" );
	var cell = document.createElement( "th" );
	cell.className = "left";
	cell.textContent = "Klasa adresu";
	row.appendChild( cell );

	var cell = document.createElement( "td" );
	cell.colSpan = 4;
	cell.textContent = IP.ipclass;
	row.appendChild( cell );
	table.appendChild( row );

	table.appendChild( rowDec( "Adres IP", IP.ip ) );
	table.appendChild( rowDec( "Maska", IP.mask ) );
	table.appendChild( rowSpace() );
	table.appendChild( rowDec( "Adres sieci", IP.net ) );
	table.appendChild( rowDec( "Adres rozgłoszeniowy", IP.baseband ) );
	table.appendChild( rowSpace() );
	table.appendChild( rowBin( "Adres IP", IP.ip, IP.masklen ) );
	table.appendChild( rowBin( "Maska", IP.mask, IP.masklen ) );
	table.appendChild( rowBin( "Odwrócona Maska", IP.nmask, IP.masklen ) );
	table.appendChild( rowSpace() );
	table.appendChild( rowBin( "Adres sieci", IP.net, IP.masklen ) );
	table.appendChild( rowBin( "Adres rozgłoszeniowy", IP.baseband, IP.masklen ) );
	table.appendChild( rowSpace() );

	/*	zakres hostów */
	var row = document.createElement( "tr" );
	var cell = document.createElement( "th" );
	cell.className = "left";
	cell.textContent = "Zakres IP hostów";
	row.appendChild( cell );

	var cell = document.createElement( "td" );
	cell.colSpan = 4;
	cell.textContent = ipToString10( IP.hostrange[0] ) + " - " + ipToString10( IP.hostrange[1] );
	row.appendChild( cell );
	table.appendChild( row );

	/*	liczba hostów */
	var row = document.createElement( "tr" );
	var cell = document.createElement( "th" );
	cell.className = "left";
	cell.textContent = "Liczba IP hostów";
	row.appendChild( cell );

	var cell = document.createElement( "td" );
	cell.colSpan = 4;
	cell.innerHTML = "2<sup>" + ( 32 - IP.masklen ) + "</sup> - 2 = " + ( Math.pow( 2, 32 - IP.masklen ) - 2 );
	row.appendChild( cell );
	table.appendChild( row );

	/* tabela */
	document.getElementById( "container" ).innerText = [];
	document.getElementById( "container" ).appendChild( table );

	/* pokaż przyciski disco */
	document.getElementById( "disc" ).style.display = "inline-block";
	/* pokaż przyciski do podziału na podsieci */
	document.getElementById( "subv" ).style.display = "inline";
}
function printSubnets( IP ) {
	var table = document.createElement( "table" );
	table.className = "dataset";

	function rowDec( title, array ) {
		var row = document.createElement( "tr" );
		var cell = document.createElement( "th" );
		cell.className = "top";
		cell.textContent = title;
		row.appendChild( cell );

		for( var i = 0; i < 4; ++i ) {
			var cell = document.createElement( "td" );
			cell.textContent = array[i].toString();
			row.appendChild( cell );
		}
		return row;
	};
	
	var row = document.createElement( "tr" );

	//numer podsieci
	var cell = document.createElement( "th" );
	cell.className = "top";
	cell.innerHTML = "Numer<br>podsieci";
	row.appendChild( cell );

	//adres podsieci
	var cell = document.createElement( "th" );
	cell.className = "top";
	cell.textContent = "Adres podsieci";
	row.appendChild( cell );

	//adres rozgłoszeniowy
	var cell = document.createElement( "th" );
	cell.className = "top";
	cell.textContent = "Adres rozgłoszeniowy";
	row.appendChild( cell );

	//zakres hostów
	var cell = document.createElement( "th" );
	cell.className = "top";
	cell.textContent = "Zakres hostów";
	row.appendChild( cell );

	//liczba hostów
	var cell = document.createElement( "th" );
	cell.className = "top";
	cell.textContent = "Liczba hostów w podsieci";
	row.appendChild( cell );

	//maska podsieci
	var cell = document.createElement( "th" );
	cell.className = "top";
	cell.textContent = "Maska podsieci";
	row.appendChild( cell );
	table.appendChild( row );

	for( var j = 0; j < IP.subsnum; ++j ) {
		var subnet = IP.subs[j];
		var row = document.createElement( "tr" );

		//numer podsieci
		var cell = document.createElement( "td" );
		cell.textContent = "#"+(j+1);
		row.appendChild( cell );

		//adres podsieci
		var cell = document.createElement( "td" );
		cell.textContent = ipToString10(subnet.net);
		row.appendChild( cell );

		//adres rozgłoszeniowy
		var cell = document.createElement( "td" );
		cell.textContent = ipToString10( subnet.baseband );
		row.appendChild( cell );

		//zakres hostów
		var cell = document.createElement( "td" );
		cell.textContent = ipToString10( subnet.hostrange[0] ) + " - " + ipToString10( subnet.hostrange[1] );
		row.appendChild( cell );
				
		if( j == 0 ) {
			//liczba hostów
			var cell = document.createElement( "td" );
			cell.rowSpan = IP.subsnum;
			cell.innerHTML = "2<sup>" + ( 32 - subnet.masklen ) + "</sup> - 2 = " + ( Math.pow( 2, 32 - subnet.masklen ) - 2 );
			row.appendChild( cell );

			//maska podsieci
			var cell = document.createElement( "td" );
			cell.rowSpan = IP.subsnum;
			cell.textContent = ipToString10( IP.submask );
			row.appendChild( cell );
		}
		table.appendChild( row );
	}
	
	/* tabela */
	var maintable = document.getElementById( "container" ).firstChild;
	document.getElementById( "container" ).innerText = "";
	document.getElementById( "container" ).appendChild( maintable );
	document.getElementById( "container" ).appendChild( table );

	/* pokaż przyciski disco */
	//document.getElementById( "disc" ).style.display = "inline-block";
}

function convert() {
	var bin = /^(0b)?[0-1]{1,8}$/i;
	var dec = /^[0-9]{0,3}$/i;
	var hex = /^(0x)?[0-9a-f]{1,2}$/i;
	var str = document.getElementById( "converter" ).value;

	if( dec.test( str ) && str[0] != '0' ) {
		if( bin.test( str ) && !g_info ) {
			alert( "Jesli liczba sklada sie z maksymalnie 3 znakow: zer i jedynek, to jest traktowana jako dziesietna. Zeby temu zapobiedz, dodaj '0' lub '0b' na poczatek." );
			g_info = true;
		}
		var str = Number( str );
		if( str > 255 ) {
			alert( "Za duza liczba (x>255)" );
			return;
		}
		// dec > bin
		if( str < 8 )
			document.getElementById( "converter" ).value = "0b" + str.toString( 2 );
		else
			document.getElementById( "converter" ).value = str.toString( 2 );
	} else if( bin.test( str ) ) {
		if( str[1] == 'b' )
			str = str.slice( 2 );
		var str = parseInt( str, 2 );
		//bin > hex
		document.getElementById( "converter" ).value = "0x" + str.toString( 16 );
	} else if( hex.test( str ) ) {
		if( str[1] == 'x' )
			str = str.slice( 2 );
		var str = parseInt( str, 16 );
		//hex > dec
		document.getElementById( "converter" ).value = +str;
	} else {
		alert( "Błędny format!" );
	}
}
function setcolor() {
	var colmax = 80;
	var r = Math.floor(( Math.random() * 1000 ) % colmax );
	var g = Math.floor(( Math.random() * 1000 ) % colmax );
	var b = Math.floor(( Math.random() * 1000 ) % colmax );
	for( var i = 0; i < document.getElementsByClassName( "dataset" ).length; ++i)
			document.getElementsByClassName( "dataset" )[i].style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
}
function disco() {
	var rate = 500;

	g_disco = !g_disco;
	if( g_disco ) {
		document.getElementById( "bd" ).innerHTML = "Stop";
		document.getElementById( "bp" ).style.display = "table-cell";
		setcolor();
		g_interval = setInterval( setcolor, rate );
	} else {
		clearInterval( g_interval );
		for( var i = 0; i < document.getElementsByClassName( "dataset" ).length; ++i)
			document.getElementsByClassName( "dataset" )[i].style.backgroundColor = "#222222";
		document.getElementById( "bd" ).innerHTML = "Disco!";
		document.getElementById( "bp" ).style.display = "none";
	}
}
function pause() {
	if( g_disco ) {
		g_disco = !g_disco;
		clearInterval( g_interval );
		document.getElementById( "bd" ).innerHTML = "Disco!";
		document.getElementById( "bp" ).style.display = "none";
	}
}
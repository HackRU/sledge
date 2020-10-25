function zeroPad(number: number, size = 2) {
  let s = String(number);
  while (s.length < size) { s = '0' + s;}
  return s;
}

// Convert time from miliseconds int to hh:mm:ss.S string
export default function timeFormat(miliseconds: number) {

  let remaining = miliseconds / 1000;

  const hh = parseInt( String(remaining / 3600), 10);

  remaining %= 3600;

  const mm = parseInt( String(remaining / 60), 10 );
  const ss = parseInt( String(remaining % 60), 10 );
  const S  = parseInt( String((miliseconds % 1000) / 100), 10 );

  return `${ zeroPad( hh ) }:${ zeroPad( mm ) }:${ zeroPad( ss ) }.${ S }`;
}

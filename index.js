#!/usr/bin/env node
/**************************************
 *  cue2srt
 *  Copyright (c) 2019 Silverspex
 *************************************/

'use strict';

const options = require('commander');
options
  .usage('[options] incuefile')
  .description('Converts VirtualDJ CUE files into SRT video subtitles.')
  .version(require('./package.json').version, '-v, --version')
  .option('-o, --output <path>', 'Specify a path for file that overrides default.')
  .option('-d, --delay <seconds>', 'Delay, in seconds, for when title should show.', 5)
  .option('-t, --trim <seconds>', 'Hide title number of seconds before track finished.', 5)
  .option('--duration <seconds>', 'Duration of title, in seconds (overrides trim). -1 for complete track.', -1)
  .option('--offset <seconds>', 'Positive or negative offset in seconds for time correction.', 0)
  .option('--ucartist', 'Upper-case artist')
  .option('--uctitle', 'Upper-case title')
  .option('--titlefirst', 'Switch order, title on top.')
  .option('--ignorepar', 'Ignore content in parenthesis.')
  .option('--template <path>', 'Use template file for title and artist. Overrides title/artist options.')
  .option('-x, --overwrite', 'Overwrite output file if already exists.')
  .parse(process.argv);

if ( !options.args.length ) return options.outputHelp();

const fs = require('fs');

let file;
try {
  const _err = () => console.log('Sorry, need a VirtualDJ CUE file as input.');
  if ( fs.statSync(options.args[ 0 ]).size > 10485760 ) return _err();  // max 10mb
  file = fs.readFileSync(options.args[ 0 ], 'utf-8');
  if ( !file.startsWith('PERFORMER') ) return _err();
}
catch {
  console.log('Sorry, could not open this file:');
  console.log(options.args[ 0 ]);
  return;
}

const outFilename = options.output || getSRTFileName(options.args[ 0 ]);
const lines = file.split('\n');
const tracks = [];

let track = null;
let duration = 0;

// Parse CUE file

lines.forEach(fileLine => {
  const line = fileLine.trim();
  if ( line.startsWith('TRACK ') ) {
    if ( track ) tracks.push(track);
    track = {};
  }
  else if ( line.startsWith('TITLE ') ) {
    if ( track ) {  // track title
      track.title = line.substr(line.indexOf(' ') + 1).replace(/"/g, '');
    }
    else {  // top-level title. VDJ sets this to duration (although incorrectly..)
      duration = stamp2time(line.substr(line.lastIndexOf(' ') + 1).replace(/"/g, ''));
    }
  }
  else if ( track && line.startsWith('PERFORMER ') ) {  // track artist
    track.artist = line.substr(line.indexOf(' ') + 1).replace(/"/g, '');
  }
  else if ( track && line.startsWith('INDEX ') ) {  // time stamp (VDJ seem to always set last segment to 00....)
    track.time = stamp2time(line.substr(line.lastIndexOf(' ') + 1));
  }
});

// Push last parsed track
if ( track ) tracks.push(track);

// Build SRT file
if ( tracks.length ) {
  console.log(`Parsed ${ tracks.length } tracks.`);

  // Load template file if specified.
  let template = null;
  if ( options.template ) {
    try {
      template = fs.readFileSync(options.template, 'utf-8')
        .replace(/\r/gm, '').split('\n').filter(l => !l.startsWith('#')).join('\r\n');
    }
    catch {
      console.log('Could not load template file. Aborting...');
      return;
    }
  }

  const trackDuration = parseFloat(options.duration);
  const trackOffset = parseFloat(options.offset);
  const trackDelay = parseFloat(options.delay);
  const trackTrim = parseFloat(options.trim);
  let srt = [];

  tracks.forEach((track, i) => {
    const time = track.time + trackOffset + trackDelay;
    const nextTrack = tracks[ i + 1 ];
    const nextTime = trackDuration >= 0 ? time + trackDuration : ((nextTrack ? nextTrack.time : duration) + trackOffset - trackTrim);
    const artist = options.ucartist ? track.artist.toUpperCase() : track.artist;
    const title = checkParenthesis(options.uctitle ? track.title.toUpperCase() : track.title, options.ignorepar);
    if ( nextTime - time < 0.1 ) console.log(`Warning: track ${ i + 1 } "${ title }" duration too short.`);

    srt.push(i + 1, `${ time2stamp(time) } --> ${ time2stamp(nextTime) }`);
    if ( template ) {
      //noinspection JSUnresolvedFunction
      srt.push(template.replace(/TITLE|ARTIST/g, w => w === 'ARTIST' ? artist : title));
    }
    else {
      options.titlefirst ? srt.push(title, artist) : srt.push(artist, title);
    }
    srt.push('');
    // todo consider "bumper mode": shows title at start and end (with duration), but not in the "middle".
  });

  // save out file
  if ( !options.overwrite && fs.existsSync(outFilename) ) {
    return console.log('Output file already exists. Aborting... Also see option "-x, --overwrite".');
  }

  try {
    fs.writeFileSync(outFilename, srt.join('\r\n'));
    console.log(`Output: ${ outFilename }`);
    console.log('Saved - Done!');
  }
  catch(err) {
    console.log(`Could not save to file: ${ outFilename }\n${ err }`);
  }
}
else {
  console.log('No tracks to build SRT from. Nothing to save...');
}

function getSRTFileName(path) {
  const dot = path.lastIndexOf('.');
  return (dot < 0 ? path : path.substr(0, dot)) + '.srt';
}

function stamp2time(st) {
  const segments = st.split(':').map(s => s | 0);
  if ( segments.length === 2 ) segments.push(0);
  if ( segments.length === 3 ) {
    return segments[ 0 ] * 60 + segments[ 1 ];
  }
  else if ( segments.length === 4 ) {
    return segments[ 0 ] * 3600 + segments[ 1 ] * 60 + segments[ 2 ];
  }
  else return 0;
}

function time2stamp(time) {
  function pad2(n) {return n < 10 ? '0' + n : '' + n;}

  return pad2((time / 3600) | 0) + ':' + pad2((time / 60 % 60) | 0) + ':' + pad2((time % 60) | 0) + ',000';
}

function checkParenthesis(txt, remove) {
  txt = txt.trim();
  return remove && !txt.startsWith('(') ? txt.split('(')[ 0 ].trim() : txt;
}
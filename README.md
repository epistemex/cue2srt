cue2srt
=======

Converts VirtualDJ CUE files to SRT subtitle files for video DJs.


Usage
-----

From command line:

    cue2srt mymix.cue

The srt file will be saved next to the video and cue file with the `.srt`
extension. You can use a full path to the cue file if needed. Remember to enclose
it in quotes if the path contains spaces:

    cue2srt "c:\path to\my\cue file\mymix.cue"

Use `--help` or `-h` to see all options:

    cue2srt -h

Advanced usage
--------------

**Timings:**

To show title 5 seconds in for 9 seconds:

    cue2srt -d 5 --duration 9 mymix.cue

To show title for the duration of the track, but only after 7 seconds and 7 second before
ending (`--delay` is the long form of `-d`):

    cue2srt --delay 7 --trim 7 mymix.cue

To correct a time difference you can use the `--offset` option:

    cue2srt --offset 0.7 mymix.cue

This delays the subtitles 0.7 seconds.

**Formatting:**

To upper-case for example artist name:

    cue2srt mymix.cue --ucartist

You can swap order of artist and title line using:

    cue2srt mymix.cue --titlefirst

To remove content in parenthesis for titles:

    cue2srt --ignorepar mymix.cue
    
Also notice that options can come in any order.

**Templates:**

You can define a template file that allow for advanced formatting of text (assuming
your media player supports formatted SRT files). An example template file can look like:

    <font color="#ff9900"><i>TITLE</i></font>
    <font color="#21A3C5">ARTIST</font>

where the TITLE and ARTIST keywords will be replaced with actual artist and title from track.
Comments (lines starting with #) are allowed as well. 

Then simply specify the path to the template file:

    cue2srt --template mytemplate.txt mymix.cue

See included demo template file for details.

**Pipes**

Instead of a file output you can output the result to a pipe. Information is outputted
to STDERR while the SRT is outputted to STDOUT. With this you can do:

    cue2srt mymix.cue --pipe > subtitles.srt

or process the content by piping it into a post-processor:

    cue2srt mymix.cue --pipe | somepostprocessor.exe


Requirements
------------

Install [Node.js](https://nodejs.org/en/) v12 or newer for your platform (Windows,
MacOS, Linux). The installation comes with the NPM tool (a package manager).
After installing Node.js, open the CLI/command shell and type (or copy paste the
line below):

    npm i -g silverspex/cue2srt

This will install the files from this repository. once finished, you'll be able
to use it right away as described above.


License
-------

Copyright (c) 2019 Silverspex

You may use this software for your own personal use (home or commercially).
You may not sell, lease or rent out this software, or use it for public services.

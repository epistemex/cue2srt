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

Requirements
------------

Install [Node.js](https://nodejs.org/en/) v12 or newer for your platform (Windows,
MacOS, Linux). The installation comes with the NPM tool (a package manager).
After installing Node.js, open the CLI/command shell and type (or copy paste the
line below):

    npm i -g https://github.com/silverspex/cue2srt.git

This will install the files from this repository. once finished, you'll be able
to use it right away as described above.


License
-------

Copyright (c) 2019 Silverspex

You may use this software for your own personal use (home or commercially).
You may not sell, lease or rent out this software, or use it for public services.

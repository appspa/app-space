var os = require('os');
var exec = require('child_process').execFile;

var path = require('path');
var extractRaw;
var parseApk;
var parseOutput;

parseApk = function(filename, cb) {
  var exeName = null;
  if (os.type() === 'Darwin') {
      exeName = 'aapt-osx-x86-64';
  } else if (os.type() === 'Linux') {
      exeName = 'aapt-linux';
  } else {
      throw new Error('Unknown OS!');
  }
  return exec(path.join(__dirname ,exeName), ['dump', 'badging', filename], {
    maxBuffer: 1024 * 1024 * 1024
  }, function(err, out) {
    if (err) {
      return cb(err);
    }
    return parseOutput(out, cb);
  });
};

parseOutput = function(text, cb) {
  var depth, element, indent, input, line;
  var matches, name, parent, parts, rest, type, value, _i, _len;
  if (!text) {
    return cb(new Error('No input!'));
  }
  var lines = text.split('\n');
  var result = {};
  for (var i = 0; i < lines.length; i++) {
    var kvs = lines[i].split(':')
    if (kvs.length == 2) {
      result[kvs[0]] = kvs[1];
    }
  }
  return cb(null, result);
};

parseApk.parseOutput = parseOutput;

module.exports = parseApk;

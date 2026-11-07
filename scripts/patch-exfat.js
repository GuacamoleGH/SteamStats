// =============================================================================
// SteamStats — Node.js exFAT readlink EISDIR patch
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

const fs = require('fs');

if (process.platform === 'win32') {
  if (fs.readlinkSync) {
    const origReadlinkSync = fs.readlinkSync;
    fs.readlinkSync = function (...args) {
      try {
        return origReadlinkSync.apply(this, args);
      } catch (err) {
        if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN')) {
          const e = new Error('EINVAL: invalid argument, readlink');
          e.code = 'EINVAL';
          throw e;
        }
        throw err;
      }
    };
  }

  if (fs.readlink) {
    const origReadlink = fs.readlink;
    fs.readlink = function (pathArg, optionsArg, callbackArg) {
      const cb = typeof optionsArg === 'function' ? optionsArg : callbackArg;
      const opts = typeof optionsArg === 'function' ? undefined : optionsArg;
      origReadlink(pathArg, opts, (err, linkString) => {
        if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN')) {
          const e = new Error('EINVAL: invalid argument, readlink');
          e.code = 'EINVAL';
          return cb(e);
        }
        return cb(err, linkString);
      });
    };
  }

  if (fs.promises && fs.promises.readlink) {
    const origPromisesReadlink = fs.promises.readlink;
    fs.promises.readlink = async function (...args) {
      try {
        return await origPromisesReadlink.apply(this, args);
      } catch (err) {
        if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN')) {
          const e = new Error('EINVAL: invalid argument, readlink');
          e.code = 'EINVAL';
          throw e;
        }
        throw err;
      }
    };
  }
}

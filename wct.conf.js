/*
 * Copyright (C) 2014 Scott Beck, all rights reserved
 *
 * Licensed under the MIT license
 *
 */
(function () {
  'use strict';
  module.exports = {
    varbose: true,
    /*browsers: [
      {
        browserName: 'Chrome',
        platform: 'Windows 7',
        version: 'dev',
        'screen-resolution': '800x600'
      }
    ],*/
    sauce: {
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY
    }
  };
})();

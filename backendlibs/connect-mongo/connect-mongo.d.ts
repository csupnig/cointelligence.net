// Type definitions for connect-flash
// Project: https://github.com/jaredhanson/connect-flash
// Definitions by: Andreas Gassmann <https://github.com/AndreasGassmann/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../express/express.d.ts" />
declare module "connect-mongo" {
    import express = require('express');

    function e(options?: any): express.RequestHandler;
    export = e;
}
"use strict";

let createBase = x => y => x + y;

let addSix = createBase(6);
addSix(10); // returns 16
addSix(21); // returns 27

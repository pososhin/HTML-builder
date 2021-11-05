var fs = require('fs');
var path = require('path');
const check_version = require('../01-read-file/checkversion');

// Вся логика вынесена в НЕ строний, а мой модуль bundlecss.js
// Он тут же рядом. Не забудь проверить синхронные методы и там  
// Это сделано, что бы в шестом задании не повторяться.
const bundlecss = require('./bundlecss').bundle;

check_version.valid();

const DIR = './05-merge-styles/';
const DIR_STYLE = DIR + 'styles';
const FILE_BUNDEL = DIR + 'project-dist/bundle.css';

bundlecss(DIR_STYLE,FILE_BUNDEL);
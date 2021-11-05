var fs = require('fs');
var path = require('path');
const check_version = require('../01-read-file/checkversion');

// Вся логика вынесена в НЕ строний, а мой модуль bundlecss.js
// Он тут же рядом. Не забудь проверить синхронные методы и там  
// Это сделано, что бы с шестом задании не повторяться.
const bundlecss = require('./bundlecss');

check_version.valid();

const DIR = './05-merge-styles/';
const DIR_STYLE = DIR + 'styles';
const FILE_BUNDEL = DIR + 'project-dist/bundle.css';

bundlecss.bundle(DIR_STYLE,FILE_BUNDEL);
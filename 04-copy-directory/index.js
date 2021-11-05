// Вся логика вынесена в НЕ стороний, а мой модуль cpfolder.js
// Он тут же рядом. Не забудь проверить синхронные методы и там... 
// А еще надо проверять на запрещеный метод fsPromises.cp() 
// Это сделано, что бы с шестом задании не повторяться.
const check_version = require('../01-read-file/checkversion');
const copy_folder = require('./cpfolder').cp;

const DIR = './04-copy-directory/'
const DIR_SOURCE = 'files'
const DIR_TARGET = 'files-copy'

check_version.valid();

copy_folder(DIR+DIR_SOURCE,DIR+DIR_TARGET);

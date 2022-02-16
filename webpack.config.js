const path = require('path');

 module.exports = {
 entry: './basicLiveStreaming.js',
 output: {
 filename: 'bundle.js',
 path: path.resolve(__dirname, './dist'),
 },
 devServer: {
 compress: true,
 port: 9000
 }
 };
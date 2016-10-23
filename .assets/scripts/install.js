const path = require('path');
const { execute, directoryExists } = require('./helper.js');
const { name } = require('../../package.json');

directoryExists(
	path.resolve('../../node_modules/' + name),
	/*
	 * We are installed as an npm package
	 */
	() => {
		console.log('we are in an npm package');
	},
	/*
	 * We are a cloned repository
	 */
	() => {
		console.log('we are in an cloned repository');
	}
);

/*
 * Export Gridicons
 */

'use strict';

var multiline = require('multiline');

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		// Rename files first
		copy: {
			main: {
				files: [{
					expand: true,
					cwd: 'svg-min/',
					src: ['**/*.svg'],
					dest: 'svg/output/',
					rename: function(dest, src) {
						return dest + src.split('_')[1];
					}
				}]
			},
		},

		// minifies SVGs
		svgmin: {
				options: {
						plugins: [
								{
										removeViewBox: false
								}, {
										removeUselessStrokeAndFill: false
								}
						]
				},
				dist: {
						files: [{
							expand: true,
							cwd: 'svg',
							src: ['*.svg'],
							dest: 'svg-min/',
							ext: '.svg'
						}]
				}
		},

		// Configuration to be run (and then tested).
		svgstore: {
			withCustomTemplate:{
				options: {
					prefix : 'gridicon-', // This will prefix each ID
					svg: { // will add and overide the the default xmlns="http://www.w3.org/2000/svg" attribute to the resulting SVG
						viewBox : '0 0 24 24',
						xmlns: 'http://www.w3.org/2000/svg'
					},

					cleanup : ['style', 'fill', 'id'],

					includedemo : multiline.stripIndent(function(){/*
					<!DOCTYPE html>
					<html>
					<head>
					<title>Gridicons</title>
					<meta name="robots" content="noindex">
					<link rel="stylesheet" type="text/css" href="gridicons-demo.css" />
					<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
					<script src="gridicons-demo.js"></script>
					<head>
					<body>

					<h1>Gridicons</h1>
					<p><em>Tap icon to get insertion code. <a href="gridicons.svg" title="Right-click -> Save as...">Download the SVG sprite</a>.</em></p>

					{{{svg}}}

					<div id="icons">
					{{#each icons}}
						<div>
							<svg>
							<use xlink:href="#{{name}}" />
							</svg>
							<p>{{title}}</p>
						</div>
					{{/each}}
					</div>

					</body>
					</html>
					*/})

				},
				files: {
					'svg-set/gridicons.svg': ['svg/output/*.svg']
				}
			},
		},

		rename: {
			moveThis: {
					src: 'svg-set/gridicons-demo.html',
					dest: 'svg-set/index.html'
			},
		},
	});

	// Load the copier
	grunt.loadNpmTasks('grunt-contrib-copy');

	// Load the SVGstore
	grunt.loadNpmTasks('grunt-svgstore');

	// Load the renamer
	grunt.loadNpmTasks('grunt-rename');

	// Load svgmin
	grunt.loadNpmTasks('grunt-svgmin');

	// Output React Component
	grunt.registerTask( 'svgreact', 'Output a react component for SVGs', function() {
		var svgFiles = grunt.file.expand( { filter: 'isFile', cwd: 'svg-min/' }, [ '**/*.svg' ] ),
			content;

		// Start the React component
		content =	"var React = require( 'react/addons' );\n\n" +
					"var Gridicon = React.createClass({\n" +
					"	render: function() {\n" +
					"		var size = '24',\n" +
					"		icon = this.props.icon,\n" +
					"		svg;\n\n" +
					"		if ( this.props.size ) {\n" +
					"			size = this.props.size;\n" +
					"		}\n\n" +
					"		switch ( icon ) {\n";

		// Create a switch() case for each svg file
		svgFiles.forEach( function( svgFile ) {
			// Clean up the filename to use for the react components
			var name = svgFile.split( '_' );
			name = name[1];
			name = name.split( '.' );
			name = name[0];

			// Grab the relevant bits from the file contents
			var fileContent = grunt.file.read( 'svg-min/' + svgFile );

			// Add className, height, and width to the svg element
			fileContent = fileContent.slice( 0, 4 ) +
						' className="gridicon gridicon__' + name + '" height={ size } width={ size }' +
						fileContent.slice( 4 );

			// Output the case for each icon
			var iconComponent = "			case '" + name + "':\n" +
								"				svg = " + fileContent + ";\n" +
								"				break;\n";

			content += iconComponent;
		} );

		// Finish up the React component
		content +=	'		}\n\n' +
					'		return (\n' +
					'			<span className="gridicon-wrapper">\n' +
					'				{ svg }\n' +
					'			</span>\n' +
					'		);\n' +
					'	}\n' +
					'} );\n\n' +
					'module.exports = Gridicon;\n';

		// Write the React component to gridicon.jsx
		grunt.file.write( 'react/gridicon.jsx', content );
	});

	// Default task(s).
	grunt.registerTask('default', ['svgmin', 'copy', 'svgstore', 'rename', 'svgreact']);

};

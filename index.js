/**
 * AssetManager
 * http://www.dadoune.com/
 *
 * Copyright (c) 2014 Reed Dadoune
 * Licensed under the MIT license.
 **/

'use strict';

var glob = require('glob'),
    fs = require('fs'),
    _ = require('underscore');

// Asset holder variable
var assets = {
};

exports.init = function (options) {
    // Glob options
    var globOptions = {sync: true};

    options = _.extend({
        // css: {},
        // js: {},
        debug: true,
        webroot: false
    }, options);

    var groups = _.keys(_.omit(options, ['debug', 'webroot']));
    _.each(groups, function(group) {
        assets[group] = [];
    });

    /**
     * Filter out assets that are not files
     *
     * @param files
     */
    var filterFiles = function (files) {
        return _.filter(files, function (file) {
            return fs.statSync(file).isFile();
        });
    };

    /**
     * Get assets from pattern. Pattern could be
     *  - an array
     *  - a string
     *  - external resource
     *
     * @param pattern
     */
    var getAssets = function (pattern) {
        var files = [];
        if (_.isArray(pattern)) {
            _.each(pattern, function (path) {
                files = files.concat(getAssets(path));
            });
        } else if (_.isString(pattern)) {
            var regex = new RegExp('^(http://|https://|//)');
            if (regex.test(pattern)) {
                // Source is external
                files.push(pattern);
            } else {
                glob(pattern, globOptions, function (er, matches) {
                    files = filterFiles(matches);
                });
            }
        }

        return files;
    };

    _.each(groups, function (group) {
        _.each(options[group], function (value, key) {
            if (!options.debug) {
                assets[group].push(key);
            } else {
                assets[group] = assets[group].concat(getAssets(value));
            }
        });
        if (options.webroot) {
            // Strip the webroot foldername from the filepath
            var regex = new RegExp('^' + options.webroot);
            _.each(assets[group], function (value, key) {
                assets[group][key] = value.replace(regex, '');
            });
        }
    });

};

exports.assets = assets;

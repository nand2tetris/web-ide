#!/usr/bin/env node

const rewire = require("rewire");
const defaults = rewire("react-scripts/scripts/build.js");
const config = defaults.__get__("config");

// Disable code splitting
config.optimization.splitChunks = {
  cacheGroups: {
    default: false,
  },
};

// Disable code chunks
config.optimization.runtimeChunk = false;

// Rename main.{hash}.js to main.js
config.output.filename = "static/js/[name].js";

// Rename main.{hash}.css to main.css
config.plugins[5].options.filename = "static/css/[name].css";
config.plugins[5].options.moduleFilename = () => "static/css/main.css";

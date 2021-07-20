"use strict";
const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require("webpack");

module.exports = env => {
    if (process.env.NODE_ENV == undefined) process.env.NODE_ENV = 'development';


    return {
        mode: process.env.NODE_ENV,
        context: path.resolve(__dirname),
        cache: true,
        entry: {
            Replay: "./wwwroot/Scripts/TSX/Replay/Replay.tsx",
            Summary: "./wwwroot/Scripts/TSX/Summary.tsx",
            WaveformViewer: "./wwwroot/Scripts/TSX/WaveformViewer.tsx",
            AggregateWaveformViewerBySOE: "./wwwroot/Scripts/TSX/AggregateWaveformViewerBySOE/AggregateWaveformViewerBySOE.tsx",
            NonLinearTimeline: "./wwwroot/Scripts/TSX/NonLinearTimeline/NonLinearTimeline.tsx"
        },
        output: {
            path: path.resolve(__dirname, 'wwwroot', 'Scripts'),
            publicPath: '../js/',
            filename: "[name].js",
            clean: false
        },
        // Enable sourcemaps for debugging webpack's output.
        devtool: "inline-source-map",

        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".css"]
        },

        module: {
            rules: [
                {
                    test: /\.scss$/, use: [
                        { loader: "style-loader" },  // to inject the result into the DOM as a style block
                        { loader: "css-modules-typescript-loader" },  // to generate a .d.ts module next to the .scss file (also requires a declaration.d.ts with "declare modules '*.scss';" in it to tell TypeScript that "import styles from './styles.scss';" means to load the module "./styles.scss.d.td")
                        { loader: "css-loader", options: { modules: true } },  // to convert the resulting CSS to Javascript to be bundled (modules:true to rename CSS classes in output to cryptic identifiers, except if wrapped in a :global(...) pseudo class)
                        { loader: "sass-loader" },  // to convert SASS to CSS
                        // NOTE: The first build after adding/removing/renaming CSS classes fails, since the newly generated .d.ts typescript module is picked up only later
                    ]
                },

                // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
                { test: /\.tsx?$/, loader: "ts-loader" },
                {
                    test: /\.css$/,
                    include: /\./,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.js$/,
                    enforce: "pre",
                    exclude: [path.resolve(__dirname, 'node_modules')],
                    loader: "source-map-loader"
                },
                { test: /\.(woff|woff2|ttf|eot|svg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader", options: { limit: 100000 } },

            ]
        },
        externals: {
        },
        optimization: {
            minimizer: [
                new TerserPlugin({ extractComments: false })
            ],
        },
        plugins: [
            new NodePolyfillPlugin(),
            new ForkTsCheckerWebpackPlugin(),
            new webpack.DefinePlugin({
                MomentFormat: "'YYYY-MM-DDTHH:mm:ss.SSSSSSS'",
                homePath: "'/'"
            })
        ]
    }
}
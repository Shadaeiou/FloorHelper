const webpack = require('webpack');
const CleanWebPackPlugin = require('clean-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const commonPaths = require('./common-paths');
const devMode = process.env.NODE_ENV !== 'prod';

const config = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: commonPaths.outputPath
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'eslint-loader',
                options: {
                    failOnWarning: true,
                    failOnerror: true
                },
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.s?css$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ]              
                // exclude: /node_modules/
            },
            {
                test: /\.svg|.png|.jpg$/,
                loader: 'url-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new MiniCssExtractPlugin('styles.css'),
        new CleanWebPackPlugin(['public'], { root: commonPaths.root }),
        new HtmlWebPackPlugin({
            template: commonPaths.template,
            favicon: commonPaths.favicon,
            inject: true
        })
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                common: {
                    filename: 'common.js',
                    name: 'common',
                    minChunks: 3,
                    chunks: 'all',
                    priority: 10,
                    reuseExistingChunk: true,
                    enforce: true
                }
            }
        }
    }
};

module.exports = config;
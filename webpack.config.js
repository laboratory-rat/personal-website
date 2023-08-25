const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
    mode,
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ]
            },
            {
                test: /\.yml$/,
                use: 'yaml-loader',
            },
            {
                test: /.html$/i,
                loader: 'html-loader',
                exclude: path.resolve(__dirname, 'src/index.html'),
            },
            {
                test: /.txt$/i,
                loader: 'raw-loader',
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Oleh Tymofieiev',
            filename: "index.html",
            template: "src/index.html"
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/assets', to: 'assets' },
            ],
        }),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.scss', '.yml'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        }
    },
    entry: {
        bundle: path.resolve(__dirname, 'src/index.ts')
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        clean: true,
    },
    devtool: mode !== 'production' ? 'inline-source-map' : false,
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        port: 3000,
        hot: true,
        compress: true,
        historyApiFallback: true,
    }
};

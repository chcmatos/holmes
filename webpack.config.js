const path = require('path');
const webpack = require("webpack");

module.exports = (env, argv) => {
    const mode = argv.mode === 'development' ? 'development' : 'production';
    const isDevMode = mode === 'development';
    const isProdMode = !!!isDevMode;
    const devtool = isDevMode ? 'inline-source-map' : 'none';

    return {
        mode: mode,
        devtool: devtool,
        optimization: optimization = {
            minimize: isProdMode,
        },
        entry: {
            index: './src/index.ts',
        },
        module: {
            rules: [
                { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
        },
        output: {
            path: path.join(__dirname, "./dist"),
            filename: '[name].js',
            chunkFilename: '[name].js',
            publicPath: '/'
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(mode),
            }),
            new webpack.DefinePlugin({
                'process.env.DEBUG': JSON.stringify(isDevMode)
            }),
        ],
    };
};

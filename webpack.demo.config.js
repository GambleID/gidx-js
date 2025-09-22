import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    mode: "development",
    devtool: 'cheap-module-source-map',
    entry: './src/demo/index.js',
    output: {
        filename: 'index.js'
    },
    optimization: {
        minimize: false,
    },
    devServer: {
        open: true,
        hot: true,
        host: "localhost",
        port: 9000,
        server: 'https'
    },
    module: {
        rules: [
            {
                test: /\.(m|j|t)s$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    "style-loader",
                    { loader: "css-loader", options: { sourceMap: true } },
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/demo/index.html"
        })
    ]
};
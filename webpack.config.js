
export default {
    mode: "production",
    devtool: "source-map",
    entry: "./src/index.js",
    output: {
        filename: "index.js",
        library: "GIDX",
        libraryTarget: "umd",
        clean: true
    },
    optimization: {
        minimize: true
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
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
}
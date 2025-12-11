const commonConfig = {
    mode: "production",
    devtool: "source-map",
    entry: "./src/lib/index.js",
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
            },
            {
                test: /\.html/,
                type: "asset/source"
            }
        ]
    }
}

export default [
    {
        ...commonConfig,
        output: {
            filename: "./index.umd.js",
            library: {
                type: "umd",
                name: "GIDX"
            },
            //clean had to be removed because it doesn't work with multiple outputs. Instead, I'm running rimraf before webpack in the build script.
            //clean: true
        }
    },
    {
        ...commonConfig,
        output: {
            filename: "./index.esm.js",
            library: {
                type: "module"
            },
            //clean had to be removed because it doesn't work with multiple outputs. Instead, I'm running rimraf before webpack in the build script.
            //clean: true
        },
        experiments: {
            outputModule: true
        }
    }
]

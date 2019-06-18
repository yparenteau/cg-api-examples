const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackIncludeAssetsPlugin = require("html-webpack-include-assets-plugin");
const HtmlWebpackExcludeAssetsPlugin = require("html-webpack-exclude-assets-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const path = require("path");
const fs = require("fs");

// Using yarn workspaces; all node_modules at root with no links in each package's local node_modules.
// TODO I guess the plugins may get updated or can be convinced to walk up the filesystem...
const repoRoot = "../../..";

// ---------------------------------------------------------------------------------------------------------------------------------

const config = {
    entry: "./src/index.ts",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "lib"),
        library: "activ_workstation",
        libraryTarget: "umd"
    },
    devtool: "source-map",
    resolve: {
        modules: [path.resolve(__dirname, "style"), "node_modules"],
        extensions: [".ts", ".js"]
    },
    externals: {
        "@activfinancial/cg-api": {
            root: "activ",
            commonjs: "@activfinancial/cg-api",
            commonjs2: "@activfinancial/cg-api",
            amd: "@activfinancial/cg-api"
        },
        // Openfin is provided by the openfin runtime.
        openfin: ""
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: "source-map-loader",
                enforce: "pre"
            },
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.less$/,
                use: ["style-loader", "css-loader", "less-loader"]
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg|otf)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            outputPath: "img"
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        // For bootstrap; make jQuery available.
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "src/index.html"
        }),
        new CopyWebpackPlugin(["static", "app.json", "style/common.css"]),
        new CopyWebpackPlugin([
            {
                from: path.join(repoRoot, "node_modules/@activfinancial/cg-api/lib/index.js"),
                to: `@activfinancial/cg-api/lib/index.js`
            }
        ])
    ],
    devServer: {
        // Note webpack-dev-server won't watch non-generated files for changes,
        // so to reload if e.g. the top level html is updated we need this config section.
        port: 8881,
        // HACK something broke recently. Seems to think there's always a change to rebuild, so
        // the app keep reloading in a loop. So disabled for now.
        inline: false
    },
    optimization: {
        // Use terser; default uglify-es is somewhat broken with ES modules.
        minimizer: [
            new TerserPlugin({
                sourceMap: true
            })
        ]
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------

module.exports = function(env, argv) {
    const srcDir = "src/pages";
    const pages = (() => {
        let pages = [];

        for (const page of fs.readdirSync(srcDir)) {
            const type = page.replace(/\.html$/, "");
            if (type !== page) {
                pages.push({ page, type });
            }
        }

        return pages;
    })();

    // HtmlWebpackPlugin for each src/pages/*.html.
    for (const { page, type } of pages) {
        const plugin = new HtmlWebpackPlugin({
            filename: page,
            template: path.join(srcDir, page),
            // Stop pages from including top level output filename. Only index.html needs it.
            excludeAssets: /^index\.js$/
        });

        config.plugins.push(plugin);
    }

    for (const { page, type } of pages) {
        const plugin = new HtmlWebpackIncludeAssetsPlugin({
            files: page,
            assets: ["./common.css", `@activfinancial/${type}/lib/index.js`],
            append: false
        });

        config.plugins.push(plugin);

        const copyJsPlugin = new CopyWebpackPlugin([
            {
                from: path.join(repoRoot, `node_modules/@activfinancial/${type}/lib/index.js`),
                to: `@activfinancial/${type}/lib/index.js`
            }
        ]);

        config.plugins.push(copyJsPlugin);
    }

    // All pages need cg-api.
    config.plugins.push(
        new HtmlWebpackIncludeAssetsPlugin({
            assets: "@activfinancial/cg-api/lib/index.js",
            append: false
        })
    );

    // Only seems to work at the end.
    config.plugins.push(new HtmlWebpackExcludeAssetsPlugin());

    return config;
};

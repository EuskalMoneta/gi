// require our dependencies
var webpack = require('webpack')
var path = require('path')
var I18nPlugin = require("i18n-webpack-plugin")

var languages = {
    "fr": null,
    "eu": require('./static/locales/eu.json')
}

module.exports = Object.keys(languages).map(function(language) {
    return {
        // the base directory (absolute path) for resolving the entry option
        context: __dirname,

        // If you have a big problem on the front-side (with React, etc ...)
        // You can activate this, its generates the .map for the bundles,
        // and using Chrome this helps a LOT to locate where the problem is in your code exactly:
        // devtool: 'source-map',

        entry: {
            Base: './static/js/base',
            ChangePassword: './static/js/change-password',
            Login: './static/js/login',
            BDC: './static/js/bdc',
            BDCManager: './static/js/bdc-manager',
            BDCCreate: './static/js/bdc-create',
            Coffre: './static/js/coffre',
            GenericView: './static/js/generic-view',
            ComptesEnBanque: './static/js/comptes',
            Operations: './static/js/operations',
            SortieCoffre: './static/js/sortie-coffre',
            EntreeStock: './static/js/entree-stock',
            SortieStock: './static/js/sortie-stock',
            History: './static/js/history',
            BankDeposit: './static/js/bank-deposit',
            CashDeposit: './static/js/cash-deposit',
            ChangesPrelevement: './static/js/changes-prelevement',
            ChangeVirement: './static/js/change-virement',
            ResilierAdherent: './static/js/resilier-adherent',
            Dons3Pourcent: './static/js/dons-3-pourcent',
            ExportVersOdoo: './static/js/export-vers-odoo',
        },

        output: {
            // where you want your compiled bundle to be stored
            path: '/assets/bundles/',
            // naming convention webpack should use for your files
            filename: 'js/'+ language + '.[name].js',
        },

        plugins: [
            // makes our dependencies available in every module
            new webpack.ProvidePlugin({
                Promise: 'imports?this=>global!exports?global.Promise!es6-promise',
                fetch: 'imports?this=>global!exports?global.fetch!whatwg-fetch',
                Raven: 'raven-js',
                React: 'react',
                ReactDOM: 'react-dom',
                ReactToastr: 'react-toastr',
                Formsy: 'formsy-react',
                FRC: 'formsy-react-components',
                moment: 'moment',
                "_": 'underscore'
            }),
            new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fr|eu/),
            new I18nPlugin(
                languages[language]
            )
        ],

        module: {
            loaders: [
                // a regexp that tells webpack use the following loaders on all
                // .js and .jsx files
                {
                    test: /\.jsx?$/,
                    // we definitely don't want babel to transpile all the files in
                    // node_modules. That would take a long time.
                    exclude: /node_modules/,
                    // use the babel loader
                    loader: 'babel'
                },
                // Classic CSS + SASS preprocessor
                {
                    test: /\.css$/,
                    exclude: /\.useable\.css$/,
                    loaders: ['style', 'css']
                },
                {
                    test: /\.useable\.css$/,
                    loaders: ['style/useable', 'css']
                },
                {
                    test: /\.scss$/,
                    loaders: ["style", "css?sourceMap", "sass?sourceMap"]
                },
                {
                    test: /\.json/,
                    loader: 'json-loader'
                },
                // We want to use bootstrap
                // Bootstrap is based on webfonts / svg and other cool things
                // We need webpack to handle those for us
                {
                    test: /\.svg/,
                    loader: 'svg-url-loader'
                },
                {
                    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: "url-loader?limit=10000&mimetype=application/font-woff"
                },
                {
                    test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: "file-loader"
                }
            ]
        },
        url: {
            dataUrlLimit: 1024 // 1 kB
        },

        resolve: {
            root: path.resolve(__dirname),

            alias: {
                Utils: 'static/js/utils',
                ComptesBanquesDepot: 'static/js/comptes-banques',
                ComptesDedies: 'static/js/comptes-dedies',
            },

            // tells webpack where to look for modules
            modulesDirectories: ['node_modules'],
            // extensions that should be used to resolve modules
            extensions: ['', '.js', '.jsx']
        }
    }
})

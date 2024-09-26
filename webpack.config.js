const path = require('path');
const autoprefixer = require('autoprefixer')
const HtmlWebpackPlugin = require('html-webpack-plugin')



// Optional if you want to load *.css and *.module.css files
//var cssRules = require('@kitware/vtk.js/Utilities/config/dependency.js').webpack.css.rules;


module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
		{ test: /\.html$/, loader: 'html-loader' },
        { test: /\.(png|jpg)$/, type: 'asset' },
        { test: /\.svg$/, type: 'asset/source' },
        { test: /\.css$/, use: ['style-loader','css-loader']},

        {
            test: /\.(scss)$/,
            use: [
            {
                // Adds CSS to the DOM by injecting a `<style>` tag
                loader: 'style-loader'
            },
            {
                // Interprets `@import` and `url()` like `import/require()` and will resolve them
                loader: 'css-loader'
            },
            {
                // Loader for webpack to process CSS with PostCSS
                loader: 'postcss-loader',
                options: {
                postcssOptions: {
                    plugins: [
                    autoprefixer
                    ]
                }
                }
            },
            {
                // Loads a SASS/SCSS file and compiles it to CSS
                loader: 'sass-loader'
            },

            ]
        }

        ]//.concat(vtkRules, cssRules),
    },
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        port: 8080,
        hot: true
      },

      plugins: [
        new HtmlWebpackPlugin({ template: './dist/index.html' }),
      ],
      //devtool: 'source-map',
      devtool: false
    
}

const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',  // Habilitar optimizaciones para producción
    entry: './src/index.js',  // Archivo de entrada principal
    output: {
        filename: 'bundle.js',  // Nombre del archivo de salida optimizado
        path: path.resolve(__dirname, 'dist'),  // Carpeta de salida
        clean: true,  // Limpiar la carpeta de salida antes de cada build
    },
    module: {
        rules: [
            { test: /\.html$/, loader: 'html-loader' },
            { test: /\.(png|jpg)$/, type: 'asset' },
            { test: /\.svg$/, type: 'asset/source' },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            {
                test: /\.(scss)$/,
                use: [
                    { loader: 'style-loader' },  // Inyectar CSS al DOM
                    { loader: 'css-loader' },  // Interpretar imports y URLs en CSS
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [autoprefixer],
                            },
                        },
                    },
                    { loader: 'sass-loader' },  // Compilar SCSS a CSS
                ],
            },
        ],
    },
    devServer: {
        static: path.resolve(__dirname, 'dist'),  // Carpeta servida por el servidor de desarrollo
        port: 8080,
        hot: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',  // Plantilla HTML desde 'src'
        }),
    ],
    devtool: false,  // Desactivar el source mapping en producción para reducir tamaño de archivo
};

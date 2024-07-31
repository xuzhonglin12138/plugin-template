module.exports = {
  presets: [
    '@babel/preset-env',
    [
      '@babel/preset-react',
      {
        "runtime": "automatic"
      }
    ]
  ],
  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": 3 
      }
    ],
    [
      "import",{
          "libraryName":"antd",
          "libraryDirectory":"es",
          "style":"css"
      }]

  ]
}
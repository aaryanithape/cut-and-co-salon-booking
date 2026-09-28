const globals = {
    __dirname: "readonly",
    afterEach: "readonly",
    beforeEach: "readonly",
    console: "readonly",
    describe: "readonly",
    expect: "readonly",
    it: "readonly",
    module: "readonly",
    process: "readonly",
    require: "readonly"
};

module.exports = [
    {
        ignores: ["node_modules/**", "coverage/**"]
    },
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals
        },
        rules: {
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "no-undef": "error",
            "no-unreachable": "error",
            "semi": ["error", "always"],
            "quotes": ["error", "double", { avoidEscape: true }]
        }
    }
];

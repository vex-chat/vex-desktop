module.exports = {
    typescript: {
        diagnosticOptions: {
            semantic: true,
            syntactic: true,
        },
        mode: "write-references",
    },
    logger: { infrastructure: "silent", issues: "console", devServer: false },
};

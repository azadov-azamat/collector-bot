module.exports = {
    apps: [
        {
            name: "admin-bot",
            script: "./bot/admin.js", // admin bot fayl yo'li
            watch: true,
            exec_mode: "fork",
            interpreter: "node",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        },
        {
            name: "client-bot",
            script: "./bot/client.js", // client bot fayl yo'li
            watch: true,
            exec_mode: "fork",
            interpreter: "node",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        }
    ]
};

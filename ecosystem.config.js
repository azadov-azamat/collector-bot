module.exports = {
    apps: [
        {
            name: "admin-bot",
            script: "./bot/admin.js",
            watch: true,
            exec_mode: "cluster",
            instances: "max",
            interpreter: "node",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            },
            max_memory_restart: "1G",
            out_file: "/dev/null", // stdout log yozilmasin
            error_file: "/dev/null", // stderr log yozilmasin
            log_file: "/dev/null", // umumiy log yozilmasin
            time: true // jarayonning vaqtini ko'rsatish
        },
        {
            name: "client-bot",
            script: "./bot/client.js",
            watch: true,
            exec_mode: "cluster",
            instances: "max",
            interpreter: "node",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            },
            max_memory_restart: "1G",
            out_file: "/dev/null",
            error_file: "/dev/null",
            log_file: "/dev/null",
            time: true
        }
    ]
};

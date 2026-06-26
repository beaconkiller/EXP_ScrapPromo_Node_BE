// pm2 stop 0 && pm2 start ecosystem.config.js --env dev && pm2 logs 0

module.exports = {
  apps: [{
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: true,
    ignore_watch: ["node_modules", "file_export", "file_storage", "config", "global_2.json"],
    env: {
      LOGS_FORMAT: "dev",
    },
    env_dev: {
      name: "EXP_Stock_Scrap_Dev",
      PORT: 4030,
      NODE_ENV: "dev",
    },
    env_prod: {
      name: "EXP_Stock_Scrap",
      PORT: 4030,
      NODE_ENV: "prod",
    },
  }],
};

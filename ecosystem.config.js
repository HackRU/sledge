module.exports = {
  apps: [
    {
      name: "sledge-server",
      script: "/var/www/sledge/server/server.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};

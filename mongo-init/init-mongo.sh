# init-mongo.sh

#!/bin/bash
set -e

# Runs automatically on first container start (official mongo image executes
# .sh files in /docker-entrypoint-initdb.d). Creates an app-level user that
# only has readWrite on the app's own database — never use the root user
# from the app itself.

mongosh <<EOF
use $MONGO_INITDB_DATABASE

db.createUser({
  user: '$MONGO_APP_USER',
  pwd: '$MONGO_APP_PASSWORD',
  roles: [{ role: 'readWrite', db: '$MONGO_INITDB_DATABASE' }]
});
EOF
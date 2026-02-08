if [ -z "$SECRET_KEY" ]; then
    echo "Error: SECRET_KEY environment variable is not set."
    exit 1
fi

flask db init
flask db migrate
flask db upgrade

exec "$@"
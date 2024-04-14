import sys
import os

settings = """server {
    server_name APP_DOMAIN;
    index index.html index.htm;
    access_log /var/log/nginx/app.log;
    error_log /var/log/nginx/app-error.log error;

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $http_host;
        proxy_pass http://127.0.0.1:APP_PORT;
        proxy_redirect off;
    }
}"""

APP_DOMAIN = sys.argv[1]
APP_PORT = sys.argv[2]

settings = settings.replace('APP_DOMAIN', APP_DOMAIN)
settings = settings.replace('APP_PORT', APP_PORT)

with open(f"/etc/nginx/sites-available/{APP_DOMAIN}", "w") as f:
    f.write(settings)

os.system(f'ln -s /etc/nginx/sites-available/{APP_DOMAIN} /etc/nginx/sites-enabled/{APP_DOMAIN}')
os.system(f'nginx -t')
os.system(f'nginx -s reload')
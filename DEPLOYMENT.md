# Deployment Guide: expanse.shivamcodes.dev

This guide deploys Expanse Tracker on a server that **already runs another website**. Both sites share the same server and public IP.

## How it works

```
Internet ──► Server public IP :80 / :443
                    │
           Host Apache + certbot (SSL)
           ├── other-project domain      ──► other project
           └── expanse.shivamcodes.dev   ──► 127.0.0.1:8081
                                                  │
                                    Docker: nginx container
                                    ├── /          → React frontend
                                    ├── /api/      → Django (gunicorn)
                                    ├── /admin/    → Django admin
                                    ├── /static/   → collected static files
                                    └── /media/    → uploaded profile pictures
```

- The host Apache (already serving the other project) owns ports 80 and 443. It handles HTTPS and sends each request to the right project based on the domain name.
- This project's Docker Nginx listens only on `127.0.0.1:8081`, so it doesn't conflict with the other project.
- Postgres, Redis, Celery and Celery Beat run inside Docker and are not exposed to the internet.
- Uploaded files are stored on the server's disk in `ExpanseTraker/media/`. AWS S3 is no longer used.

**Requirements:** a Linux server with Docker, the Docker Compose plugin (`docker compose version` must work) and Apache installed directly on the server (not in Docker). Your user needs sudo access to Apache (`a2enmod`, `a2ensite`, `systemctl reload apache2`); otherwise ask the server admin to do steps 6 and 7.

> Don't install or start Nginx on the host. Apache already holds ports 80/443, so host Nginx fails to start with "Address already in use".

---

## 1. Push the code (on your laptop)

```bash
git add -A
git commit -m "Deploy setup for expanse.shivamcodes.dev"
git push origin <branch>
```

Merge into `main` on GitHub, or deploy your branch directly.

## 2. DNS

Where `shivamcodes.dev` is managed, add a record:

| Type | Name      | Value                   |
|------|-----------|-------------------------|
| A    | `expanse` | your server's public IP |

Check it before continuing:

```bash
ping expanse.shivamcodes.dev    # should show your server IP
```

## 3. Get the code on the server

```bash
ssh user@your-server-ip
git clone https://github.com/divyesh3489/Ai_Gen_Expanse_Tracker.git
cd Ai_Gen_Expanse_Tracker
git checkout main
```

## 4. Create `.env`

```bash
nano .env
```

```env
SECRET_KEY=<a long random string>
DEBUG=False

APP_DOMAINS=expanse.shivamcodes.dev
DOMAIN=https://expanse.shivamcodes.dev
FRONTEND_URL=https://expanse.shivamcodes.dev
FRONTEND_LOGIN_URL=https://expanse.shivamcodes.dev/login

# Database: must match the postgres service in docker-compose.prod.yml
# production must be set, otherwise Django falls back to SQLite
production=True
database=expanse_tracker_db
user_name=postgres
password=admin
host=postgres
port=5432

REDIS_URL=redis://redis:6379/0
REDIS_CACHE_URL=redis://redis:6379/1

EMAIL_HOST_USER=<your gmail>
EMAIL_HOST_PASSWORD=<gmail app password>
```

Notes:

- Generate a secret key with `python3 -c "import secrets; print(secrets.token_urlsafe(50))"`.
- Write every line as `KEY=value`, with no spaces around `=`.
- Add any other keys the app uses, such as AI API keys. `AWS_*` keys are no longer needed.
- `APP_DOMAINS` accepts several domains separated by commas. They are added to `ALLOWED_HOSTS`, CORS and CSRF automatically.

## 5. Start the app

Check that port 8081 is free:

```bash
sudo ss -tlnp | grep 8081    # should print nothing
```

If 8081 is already in use, pick another port. Change it in both `docker-compose.prod.yml` (`127.0.0.1:8081:80`) and `deploy/host-apache.conf` (`ProxyPass` / `ProxyPassReverse`).

Build and start:

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps             # every service should be "Up"
docker compose -f docker-compose.prod.yml logs -f web    # Ctrl+C to exit
```

Migrations and `collectstatic` run automatically when the `web` container starts.

Test the app from the server itself:

```bash
curl -I http://127.0.0.1:8081    # expect HTTP 200
```

Create an admin user:

```bash
docker compose -f docker-compose.prod.yml exec web python manage.py createsuperuser
```

## 6. Host Apache

```bash
sudo a2enmod proxy proxy_http headers
sudo cp deploy/host-apache.conf /etc/apache2/sites-available/expanse.shivamcodes.dev.conf
sudo a2ensite expanse.shivamcodes.dev
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Check that Apache routes the domain here and the other project's sites are still listed:

```bash
sudo apache2ctl -S
```

## 7. SSL certificate (certbot)

```bash
sudo apt install -y certbot python3-certbot-apache   # skip if already installed
sudo certbot --apache -d expanse.shivamcodes.dev
sudo certbot renew --dry-run                         # confirms auto-renewal works
```

Certbot creates an HTTPS copy of the site (`expanse.shivamcodes.dev-le-ssl.conf`) and adds the HTTP → HTTPS redirect. It also sets up automatic renewal.

> `.dev` domains work only over HTTPS in browsers. The site won't open in a browser until this step is done, and that's expected.

If a firewall is enabled:

```bash
sudo ufw allow 'Apache Full'
```

## 8. Check the live site

- [ ] `https://expanse.shivamcodes.dev` loads and you can log in
- [ ] Uploading a profile picture works and the image shows
- [ ] `https://expanse.shivamcodes.dev/admin/` opens with styling
- [ ] The other project on this server still works

---

## Updating to a new version

```bash
cd Ai_Gen_Expanse_Tracker
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Useful commands

```bash
# Logs
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f celery
docker compose -f docker-compose.prod.yml logs -f nginx
sudo tail -f /var/log/apache2/error.log        # host Apache

# Restart one service
docker compose -f docker-compose.prod.yml restart web

# Django shell
docker compose -f docker-compose.prod.yml exec web python manage.py shell

# Stop everything (data is kept)
docker compose -f docker-compose.prod.yml down
```

## Backups

Back up two things regularly:

1. **Uploaded files:** the `ExpanseTraker/media/` folder.
   ```bash
   tar czf media-$(date +%F).tar.gz ExpanseTraker/media
   ```
2. **Database:** the Postgres data.
   ```bash
   docker compose -f docker-compose.prod.yml exec -T postgres \
     pg_dump -U postgres expanse_tracker_db > db-$(date +%F).sql
   ```

## Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| `502 Bad Gateway` | The Docker app isn't running. Check `docker compose ... ps` and the `web` logs. |
| `400 Bad Request` | The domain is missing from `APP_DOMAINS` in `.env`. Fix it, then run `up -d`. |
| `413 Request Entity Too Large` on upload | The image is larger than `LimitRequestBody` (10 MB) in the host Apache site. |
| Images don't load (mixed content) | The host Apache must send `X-Forwarded-Proto`. It's already in `deploy/host-apache.conf`. |
| certbot fails | DNS doesn't point to this server yet, or port 80 is blocked by the firewall. |
| "port is already allocated" | Port 8081 is in use. Choose another port (see step 5). |
| `Invalid command 'ProxyPass'` / `'RequestHeader'` | Apache modules are off. Run `sudo a2enmod proxy proxy_http headers`. |
| `unknown shorthand flag: 'f' in -f` | The Docker Compose plugin isn't installed. Run `sudo apt install docker-compose-plugin`. |
| Docker `permission denied ... docker.sock` | Run `sudo usermod -aG docker $USER`, then log out and back in (or prefix with `sudo`). |

## Before going live

- [ ] **`DEBUG` setting:** in `ExpanseTraker/ExpanseTraker/settings.py`, `DEBUG = os.getenv("DEBUG", False)` treats any value, even `False`, as on. Change it to `DEBUG = os.getenv("DEBUG", "False") == "True"`.
- [ ] **Database password:** change `POSTGRES_PASSWORD=admin` in `docker-compose.prod.yml`, and `password=` in `.env` to match. Do this before the first start, because Postgres sets the password only when the data volume is first created.
- [ ] **Old domain:** once `expansetraker.eliscops.com` is retired, remove it from `ALLOWED_HOSTS`, CORS and CSRF in `settings.py`.

# SnackApp

```
ip a
```

In `/etc/avahi/avahi-daemon.conf` under [server] add:

```
allow-interfaces=<your-int-id>
```

then

```
sudo systemctl restart avahi-daemon
getent hosts stolik.local
```

```
sudo apt install mkcert #or winget install mkcert
mkcert -install
mkdir certs
mkcert -key-file certs/dev-key.pem -cert-file certs/dev-cert.pem stolik.local localhost 127.0.0.1 ::1
cp $HOME/.local/share/mkcert/rootCA.pem public/rootCA.pem
```

or

```
mkcert -key-file certs/dev-key.pem -cert-file certs/dev-cert.pem 10.110.200.39 localhost 127.0.0.1 ::1
```

Then one-time CA install on Android: Bezpieczeństwo i prywatność -> więcej -> szyfrowanie i ... -> public/rootCA.pem

```
npm i
npm run dev
```

## TODO

make sure ready for prod, security, load, etc.

# Cab-Configurator

## Project setup
```
npm install
```

#### Compiles and hot-reloads for development
```
npm run serve
```

#### Compiles and minifies for production
```
npm run build
```

## Deploy on heroku
1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Open a terminal and write the following commands:
```
   heroku login
   heroku apps:create --region eu arygavd-prod
   OR heroku apps:create --region us arygavd-dev
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static
   git push heroku master
```
3. Rename your remotes to push to dev/prod as needed
Configuration file for Heroku is static.json

## Deploy on netlify
Get Netlify to mirror the bitbucket repo
Configuration file for netlify is netlify.toml

## htaccess Setup
* To add multiple origins for DTM server : 

_Do NOT forget to remove localhost:8080 for DTM prod_

```apache
<IfModule mod_headers.c>
	SetEnvIf Origin "http(s)?://(www\.)?(localhost:8080|vgl-designer.herokuapp.com)$" AccessControlAllowOrigin=$0
    Header add Access-Control-Allow-Origin %{AccessControlAllowOrigin}e env=AccessControlAllowOrigin
	Header set Access-Control-Allow-Methods "*"
	Header always set Access-Control-Allow-Headers "*"
</IfModule>
```

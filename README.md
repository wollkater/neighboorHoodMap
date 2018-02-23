# Installation

Clone the repo to your local computer.

## Nginx
I used a Nginx proxy to keep the Google and Yelp API keys secret. You can get Nginx <a href='https://nginx.org/en/docs/install.html'>here</a>.
Paste the following config into your Nginx config.

    server {
        listen       80;
        server_name  localhost;
    
        location / {
           root PATH_TO_CLONED_FOLDER; #eg /home/user/map
         }
         location /api/yelp {
          proxy_pass https://api.yelp.com/v3;
          proxy_set_header Authorization 'Bearer YOUR_API_KEY';
         }
         location /api/maps {
          proxy_pass https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY;
         }
    
    }
Then reload your Nginx config with _nginx -s reload_ (or start it with nginx).

Now you can open your browser and visit http://localhost and checkout the website.

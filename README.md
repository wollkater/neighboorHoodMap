# Prerequisites 
* Docker
* Yelp and Google Maps API keys

# Installation

Clone the repo to your local computer. You also need API keys for <a href="https://www.yelp.com/fusion">Yelp</a> and <a href="https://console.developers.google.com">Google Maps</a>.

# Run

First put your API keys into the nginx.conf file. After that you can build the docker image 
with _docker build -t map ._ and run the container with _docker run --name map -d -p 8080:80 map_.
You can access the website now under http://localhost:8080.


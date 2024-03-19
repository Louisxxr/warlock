#!/bin/bash

sudo /etc/init.d/nginx start
sudo redis-server /etc/redis/redis.conf

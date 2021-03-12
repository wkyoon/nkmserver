#!/bin/bash
pm2 stop rest-server
sleep 1
pm2 start rest-server

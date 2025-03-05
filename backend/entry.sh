#!/bin/bash
rm /data/.env
cp -r /config/.env /data/.env
exec npm start
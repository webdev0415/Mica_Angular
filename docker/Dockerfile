FROM node:12.6.0

RUN apt-get update && \
    apt-get install -y xz-utils && \
    apt-get install -y curl

# Create private key file with argument passed in
RUN mkdir ~/.ssh
COPY id_rsa /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa
RUN ssh-keyscan gitlab.com >> /root/.ssh/known_hosts

RUN apt update -y && \
    npm install -g @angular/cli

COPY . /mica
WORKDIR /mica
ARG ENVIRONMENT

RUN npm i
RUN npm run version:up
RUN npm run build:$ENVIRONMENT

RUN rm /root/.ssh/id_rsa

# FILEBEAT
RUN apt install curl -y
RUN curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-6.8.8-amd64.deb
RUN dpkg -i filebeat-6.8.8-amd64.deb
COPY docker/filebeat.yml /etc/filebeat/filebeat.yml
RUN chmod go-w /etc/filebeat/filebeat.yml
RUN mkdir /var/log/advinow_mica-app

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

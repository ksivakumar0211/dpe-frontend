#base image
FROM node:20 As builder 

#working directory
WORKDIR /app 

#copy package file 
COPY package.json /app

#install all depende
RUN npm install --legacy-peer-deps

#copy all rest of file file 
COPY . .

#create build for deploy
RUN npm run build 

#deployer version
FROM nginx:stable-alpine AS deployer

#remove if exist default configuration 
RUN rm /etc/nginx/conf.d/default.conf

#copy custom nginx config 
COPY nginx.conf /etc/nginx/conf.d/default.conf

#copy the build output from builder
COPY --from=builder /app/dist /usr/share/nginx/html

#indicate it will running 80 port
EXPOSE 80

#start in foreground 
CMD ["nginx", "-g", "daemon off;"]





# frontend/Dockerfile
FROM nginx:alpine

# Copy all necessary files
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/
COPY chart.min.js /usr/share/nginx/html/
COPY moment.min.js /usr/share/nginx/html/
COPY chartjs-adapter-moment.min.js /usr/share/nginx/html/

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]

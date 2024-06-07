# Image for the Quarkus application built with Mandrel
FROM registry.access.redhat.com/ubi8/ubi-minimal

WORKDIR /work/
COPY target/*-runner /work/application
RUN chmod 775 /work

ENV LIBRARY_PATH=/usr/lib64:/usr/lib

EXPOSE 8080
CMD ["./application", "-Dquarkus.http.host=0.0.0.0"]
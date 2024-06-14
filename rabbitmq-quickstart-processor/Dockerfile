FROM quay.io/quarkus/ubi-quarkus-native-image:22.3-java17 AS build
WORKDIR /work/
COPY target/*-runner /work/application
COPY target/quarkus-app/* /work/quarkus-app/
COPY target/quarkus-app/lib/ /work/quarkus-app/lib/
COPY target/quarkus-app/app/ /work/quarkus-app/app/
COPY target/quarkus-app/quarkus/ /work/quarkus-app/quarkus/

FROM registry.access.redhat.com/ubi8/ubi-minimal
WORKDIR /work/
COPY --from=build /work/ /work/
EXPOSE 8080
CMD ["./application", "-Dquarkus.http.host=0.0.0.0"]
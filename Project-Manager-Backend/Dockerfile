# Multi-stage build for .NET 8 Web API with SQLite

# 1) Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY Project-Manager-Backend.csproj ./
RUN dotnet restore "Project-Manager-Backend.csproj"

# Copy the rest of the source
COPY . .

# Publish (Release)
RUN dotnet publish "Project-Manager-Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 2) Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Environment and ports
ENV ASPNETCORE_URLS=http://+:5090
EXPOSE 5090

# Copy published output
COPY --from=build /app/publish .

# Create a writable directory for SQLite DB if needed
VOLUME ["/app/data"]

# Optional: set working directory for SQLite DB file
# If your connection string is "Data Source=projectmanager.db",
# it will be created in the current WORKDIR ("/app").

ENTRYPOINT ["dotnet", "Project-Manager-Backend.dll"]



#!/bin/bash

# Deployment script for Blockvest Social
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if required files exist
check_requirements() {
    log "Checking requirements..."
    
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        error "Docker compose file not found: $DOCKER_COMPOSE_FILE"
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        error "Environment file not found: $ENV_FILE"
    fi
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed or not in PATH"
    fi
    
    log "Requirements check passed"
}

# Build and start services
deploy() {
    log "Starting deployment for environment: $ENVIRONMENT"
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans
    
    # Pull latest images
    log "Pulling latest images..."
    docker-compose -f $DOCKER_COMPOSE_FILE pull
    
    # Build custom images
    log "Building custom images..."
    docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_health
    
    log "Deployment completed successfully!"
}

# Check service health
check_health() {
    log "Checking service health..."
    
    # Check backend
    if ! curl -f http://localhost:5000/health > /dev/null 2>&1; then
        error "Backend health check failed"
    fi
    log "Backend is healthy"
    
    # Check frontend
    if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
        error "Frontend health check failed"
    fi
    log "Frontend is healthy"
    
    # Check database
    if ! docker-compose -f $DOCKER_COMPOSE_FILE exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        error "Database health check failed"
    fi
    log "Database is healthy"
    
    # Check Redis
    if ! docker-compose -f $DOCKER_COMPOSE_FILE exec -T redis redis-cli ping > /dev/null 2>&1; then
        error "Redis health check failed"
    fi
    log "Redis is healthy"
}

# Rollback to previous version
rollback() {
    log "Rolling back to previous version..."
    
    # Stop current containers
    docker-compose -f $DOCKER_COMPOSE_FILE down
    
    # Start previous version (if available)
    if [ -f "docker-compose.prod.yml.backup" ]; then
        mv docker-compose.prod.yml.backup docker-compose.prod.yml
        docker-compose -f $DOCKER_COMPOSE_FILE up -d
        log "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Backup current deployment
backup() {
    log "Creating backup..."
    
    # Create backup of current compose file
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        cp $DOCKER_COMPOSE_FILE ${DOCKER_COMPOSE_FILE}.backup
        log "Backup created: ${DOCKER_COMPOSE_FILE}.backup"
    fi
    
    # Create backup of database
    docker-compose -f $DOCKER_COMPOSE_FILE exec -T mongodb mongodump --archive > backup_$(date +%Y%m%d_%H%M%S).archive
    log "Database backup created"
}

# Show logs
show_logs() {
    log "Showing logs for all services..."
    docker-compose -f $DOCKER_COMPOSE_FILE logs -f
}

# Show status
show_status() {
    log "Service status:"
    docker-compose -f $DOCKER_COMPOSE_FILE ps
}

# Clean up
cleanup() {
    log "Cleaning up unused Docker resources..."
    docker system prune -f
    docker volume prune -f
    log "Cleanup completed"
}

# Main script
main() {
    case "${2:-deploy}" in
        "deploy")
            check_requirements
            backup
            deploy
            ;;
        "rollback")
            rollback
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_status
            ;;
        "health")
            check_health
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            echo "Usage: $0 <environment> <command>"
            echo "Commands:"
            echo "  deploy   - Deploy the application (default)"
            echo "  rollback - Rollback to previous version"
            echo "  logs     - Show logs for all services"
            echo "  status   - Show service status"
            echo "  health   - Check service health"
            echo "  cleanup  - Clean up unused Docker resources"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"

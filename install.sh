#!/bin/bash
set -e

echo "🚀 Setting up NPL Blockchain Starter for Codespaces..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install packages using apt
install_apt_packages() {
    echo "📦 Installing system packages..."
    sudo apt-get update
    sudo apt-get install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates
}

# Function to install Java
install_java() {
    echo "☕ Installing Java..."
    if command_exists java; then
        echo "✅ Java already installed: $(java -version 2>&1 | head -n 1)"
    else
        sudo apt-get install -y openjdk-21-jdk
        echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> ~/.bashrc
        export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
        echo "✅ Java installed successfully"
    fi
}

# Function to install Maven
install_maven() {
    echo "🔨 Installing Maven..."
    if command_exists mvn; then
        echo "✅ Maven already installed: $(mvn -version | head -n 1)"
    else
        sudo apt-get install -y maven
        echo "✅ Maven installed successfully"
    fi
}

# Function to install Node.js
install_nodejs() {
    echo "🟢 Installing Node.js..."
    if command_exists node; then
        echo "✅ Node.js already installed: $(node -v)"
    else
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
        echo "✅ Node.js installed successfully"
    fi
}

# Function to install Docker
install_docker() {
    echo "🐳 Installing Docker..."
    if command_exists docker; then
        echo "✅ Docker already installed: $(docker --version)"
    else
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        echo "✅ Docker installed successfully"
    fi
    
    if command_exists docker-compose; then
        echo "✅ Docker Compose already installed: $(docker-compose --version)"
    else
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        echo "✅ Docker Compose installed successfully"
    fi
}

# Function to setup GitHub authentication
setup_github_auth() {
    echo "🔑 Setting up GitHub authentication..."
    
    if [[ -z "${GITHUB_USER_NAME}" ]] || [[ -z "${GITHUB_USER_PASS}" ]]; then
        echo "⚠️  GitHub credentials not found in environment variables."
        echo "Please set GITHUB_USER_NAME and GITHUB_USER_PASS environment variables."
        echo "You can do this by adding them to your Codespace secrets or running:"
        echo "export GITHUB_USER_NAME=your_github_username"
        echo "export GITHUB_USER_PASS=your_personal_access_token"
        return 1
    fi
    
    echo "🔐 Logging into GitHub Container Registry..."
    echo "$GITHUB_USER_PASS" | docker login ghcr.io -u "$GITHUB_USER_NAME" --password-stdin
    echo "✅ GitHub Docker login successful"
}

# Function to setup project dependencies
setup_project() {
    echo "📋 Setting up project dependencies..."
    
    # Install blockchain dependencies
    echo "⛓️  Setting up blockchain dependencies..."
    cd blockchain/avalanche
    npm install
    npx hardhat compile
    cd ../..
    
    # Install frontend dependencies
    echo "🎨 Setting up frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    # Build NPL project
    echo "🏗️  Building NPL project..."
    cd npl
    mvn clean package
    cd ..
    
    echo "✅ Project setup completed successfully"
}

# Function to verify installation
verify_installation() {
    echo "🔍 Verifying installations..."
    
    echo "Java: $(java -version 2>&1 | head -n 1)"
    echo "Maven: $(mvn -version 2>&1 | head -n 1)"
    echo "Node.js: $(node -v)"
    echo "npm: $(npm -v)"
    echo "Docker: $(docker --version)"
    echo "Docker Compose: $(docker compose version 2>/dev/null || docker-compose --version)"
    
    echo "✅ All tools verified successfully"
}

# Function to display next steps
show_next_steps() {
    echo ""
    echo "🎉 Installation completed successfully!"
    echo ""
    echo "Refer to the README.md and TUTORIAL.md files for the next steps."
}

# Main execution
main() {
    install_apt_packages
    install_java
    install_maven
    install_nodejs
    install_docker
    
    # Setup GitHub auth (optional - will warn if not available)
    setup_github_auth || echo "⚠️  Skipping GitHub authentication setup"
    
    setup_project
    verify_installation
    show_next_steps
}

# Run main function
main "$@"
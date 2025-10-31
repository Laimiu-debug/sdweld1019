#!/bin/bash

echo "========================================="
echo "Server Diagnostic and Fix"
echo "========================================="
echo ""

echo "1. Current location:"
pwd
echo ""

echo "2. Cleaning old directory..."
cd /root
rm -rf welding-system welding-system-test
echo "Done"
echo ""

echo "3. Cloning repository..."
git clone https://github.com/Laimiu-debug/sdweld1019.git welding-system

if [ $? -eq 0 ]; then
    echo "Clone successful!"
    echo ""
    
    echo "4. Checking files..."
    cd welding-system
    ls -la
    echo ""
    
    echo "5. Checking key files..."
    if [ -f "deploy.sh" ]; then
        echo "  deploy.sh: OK ($(wc -l < deploy.sh) lines)"
    else
        echo "  deploy.sh: MISSING!"
    fi
    
    if [ -f "docker-compose.yml" ]; then
        echo "  docker-compose.yml: OK ($(wc -l < docker-compose.yml) lines)"
    else
        echo "  docker-compose.yml: MISSING!"
    fi
    
    if [ -f "backend/Dockerfile" ]; then
        echo "  backend/Dockerfile: OK ($(wc -l < backend/Dockerfile) lines)"
    else
        echo "  backend/Dockerfile: MISSING!"
    fi
    echo ""
    
    echo "6. Setting permissions..."
    chmod +x deploy.sh create_default_admin.sh
    echo "Done"
    echo ""
    
    echo "========================================="
    echo "SUCCESS! Repository cloned successfully"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "1. Exit server (type: exit)"
    echo "2. Upload config files from local"
    echo "3. Return to server and run: ./deploy.sh"
    echo ""
else
    echo "Clone FAILED!"
    echo ""
    echo "Possible reasons:"
    echo "1. Repository is private"
    echo "2. Network issue"
    echo "3. Git not installed"
    echo ""
    echo "Please check:"
    echo "- Make repository public at: https://github.com/Laimiu-debug/sdweld1019/settings"
    echo "- Test network: ping github.com"
    echo "- Check git: git --version"
fi


#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-shopping-platform-217511-217520/shopping_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


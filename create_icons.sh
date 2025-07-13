#!/bin/bash

# Create a simple circular icon using ImageMagick or built-in tools
# This creates a green circle with URL text

# Create 128x128 icon
cat > /tmp/create_icon.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
<style>
body { margin: 0; padding: 0; background: transparent; }
.icon {
  width: 128px;
  height: 128px;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}
.icon::before {
  content: '';
  position: absolute;
  width: 90px;
  height: 90px;
  border: 3px dashed rgba(255,255,255,0.8);
  border-radius: 50%;
}
.text {
  color: white;
  font-family: Arial, sans-serif;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
</style>
</head>
<body>
<div class="icon">
  <div class="text">URL</div>
</div>
</body>
</html>
EOF

echo "HTML template created for icon generation"

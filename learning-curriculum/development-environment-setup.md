# Development Environment Setup & Validation

## Prerequisites Verification

### 1. Node.js and npm Installation
```bash
# Check Node.js version (required: 14.x or higher)
node --version

# Check npm version
npm --version

# If not installed, download from: https://nodejs.org/
```

### 2. UI5 CLI Installation and Setup
```bash
# Install UI5 CLI globally
npm install -g @ui5/cli

# Verify installation
ui5 --version

# Check available commands
ui5 --help
```

### 3. Git Configuration (Optional but Recommended)
```bash
# Configure Git for version control
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize repository in project folder
cd /path/to/your/project
git init
git add .
git commit -m "Initial commit - SAP UI5 Product Management App"
```

## Project Setup and Configuration

### 1. UI5 Project Initialization
```bash
# Navigate to your project directory
cd /home/keshav/Desktop/fioriApp/fioriAppPracticeJob

# Initialize UI5 project (if not already done)
ui5 init

# Install dependencies
npm install

# Verify project structure
ui5 tree
```

### 2. Development Server Configuration
```bash
# Start development server
ui5 serve

# Alternative with specific port
ui5 serve --port 8080

# With live reload (auto-refresh on changes)
ui5 serve --open
```

**Expected Output:**
```
Server started
URL: http://localhost:8080
```

### 3. Build Configuration Validation
```bash
# Test build process
ui5 build

# Build for production
ui5 build --dest dist --clean-dest

# Verify build output
ls -la dist/
```

## IDE Setup and Extensions

### Visual Studio Code Configuration

#### Essential Extensions:
```json
{
    "recommendations": [
        "SAPOSS.vscode-ui5-language-assistant",
        "SAPOSS.app-studio-toolkit",
        "ms-vscode.vscode-typescript-next",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-json"
    ]
}
```

#### Workspace Settings:
```json
{
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "files.associations": {
        "*.view.xml": "xml",
        "*.fragment.xml": "xml"
    },
    "emmet.includeLanguages": {
        "xml": "html"
    }
}
```

### SAP Business Application Studio (Alternative)
1. Access: https://account.hanatrial.ondemand.com/
2. Create Dev Space with "SAP Fiori" template
3. Import your project
4. Use built-in UI5 tools and templates

## Browser Development Tools

### Chrome DevTools Setup
1. **Install SAP UI5 Inspector Extension**
   - Chrome Web Store: "UI5 Inspector"
   - Provides UI5-specific debugging capabilities

2. **Configure Developer Tools**
   ```javascript
   // Enable UI5 debug mode
   window["sap-ui-debug"] = true;
   
   // Access UI5 core for debugging
   sap.ui.getCore()
   ```

### Firefox Developer Tools
1. Install "SAP UI5 Inspector" add-on
2. Enable responsive design mode for mobile testing

## Code Quality Tools Setup

### ESLint Configuration
```bash
# Install ESLint for UI5
npm install --save-dev eslint @sap/eslint-plugin-ui5-jsdocs

# Create .eslintrc.json
```

```json
{
    "extends": ["@sap/eslint-plugin-ui5-jsdocs/recommended"],
    "rules": {
        "no-console": "warn",
        "no-unused-vars": "error",
        "semi": ["error", "always"]
    }
}
```

### Prettier Configuration
```json
{
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": false,
    "printWidth": 120,
    "tabWidth": 4
}
```

## Testing Framework Setup

### QUnit for Unit Testing
```bash
# Install QUnit dependencies
npm install --save-dev qunit @ui5/cli

# Create test structure
mkdir -p webapp/test/unit/controller
mkdir -p webapp/test/integration
```

### OPA5 for Integration Testing
```javascript
// webapp/test/integration/AllJourneys.js
sap.ui.define([
    "sap/ui/test/Opa5",
    "./arrangements/Startup",
    "./MasterJourney",
    "./DetailJourney"
], function (Opa5, Startup) {
    "use strict";

    Opa5.extendConfig({
        arrangements: new Startup(),
        viewNamespace: "com.productapp.view.",
        autoWait: true
    });
});
```

## Performance Monitoring Setup

### Browser Performance Tools
1. **Chrome DevTools Performance Tab**
   - Record application startup
   - Analyze rendering performance
   - Monitor memory usage

2. **Lighthouse Integration**
   ```bash
   # Install Lighthouse CLI
   npm install -g lighthouse
   
   # Run performance audit
   lighthouse http://localhost:8080 --output html --output-path ./performance-report.html
   ```

### UI5 Performance Tools
```javascript
// Enable UI5 performance measurements
window["sap-ui-measure"] = true;

// Access performance data
sap.ui.require(["sap/ui/performance/Measurement"], function(Measurement) {
    console.log(Measurement.getAllMeasurements());
});
```

## Debugging Configuration

### Source Maps Setup
```javascript
// ui5.yaml configuration for source maps
specVersion: "4.0"
metadata:
  name: fioriapppracticejob
type: application
builder:
  settings:
    generateSourceMaps: true
```

### Breakpoint Configuration
```javascript
// Add to Component.js for debugging
init: function() {
    debugger; // Breakpoint for initialization debugging
    UIComponent.prototype.init.apply(this, arguments);
    // ... rest of initialization
}
```

## Environment Validation Checklist

### ✅ Basic Setup Validation
- [ ] Node.js and npm installed and working
- [ ] UI5 CLI installed globally
- [ ] Project serves successfully on localhost
- [ ] Browser can access the application
- [ ] No console errors on startup

### ✅ Development Tools Validation
- [ ] IDE with UI5 extensions configured
- [ ] Browser developer tools working
- [ ] UI5 Inspector extension installed
- [ ] Source maps loading correctly
- [ ] Breakpoints can be set and hit

### ✅ Code Quality Tools Validation
- [ ] ESLint running without errors
- [ ] Prettier formatting code correctly
- [ ] Build process completing successfully
- [ ] No TypeScript/JavaScript errors

### ✅ Testing Environment Validation
- [ ] QUnit test runner accessible
- [ ] OPA5 integration tests can run
- [ ] Test coverage reporting working
- [ ] Performance monitoring tools active

## Troubleshooting Common Issues

### Issue 1: UI5 CLI Not Found
```bash
# Solution: Reinstall UI5 CLI
npm uninstall -g @ui5/cli
npm install -g @ui5/cli
```

### Issue 2: Port Already in Use
```bash
# Solution: Use different port
ui5 serve --port 8081

# Or kill process using port
lsof -ti:8080 | xargs kill -9
```

### Issue 3: Module Loading Errors
```javascript
// Check manifest.json resourceRoots configuration
"sap.ui5": {
    "resourceRoots": {
        "com.productapp": "./"
    }
}
```

### Issue 4: CORS Issues with Local Development
```bash
# Start Chrome with disabled security (development only)
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev"
```

## Next Steps

1. **Validate Environment**: Complete all checklist items
2. **Start Module 1**: Begin with UI5 Architecture Fundamentals
3. **Set Up Version Control**: Initialize Git repository
4. **Configure Backup**: Set up regular project backups
5. **Join Community**: SAP Community, Stack Overflow tags

## Additional Resources

### Official Documentation
- **UI5 SDK**: https://ui5.sap.com/
- **Fiori Guidelines**: https://experience.sap.com/fiori-design-web/
- **UI5 CLI**: https://sap.github.io/ui5-tooling/

### Community Resources
- **SAP Community**: https://community.sap.com/
- **GitHub Samples**: https://github.com/SAP-samples
- **YouTube Tutorials**: SAP Developers channel

### Learning Platforms
- **SAP Learning Hub**: https://learning.sap.com/
- **openSAP**: https://open.sap.com/
- **SAP Tutorial Navigator**: https://developers.sap.com/tutorial-navigator.html

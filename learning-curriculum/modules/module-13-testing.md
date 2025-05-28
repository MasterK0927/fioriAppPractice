# Module 13: Testing Strategies (Unit, Integration & E2E Testing)

**Duration**: 3-3.5 hours | **Level**: Advanced | **Prerequisites**: Modules 1-12 completed

## Learning Objectives

By the end of this module, you will:
- Master QUnit unit testing framework and best practices
- Implement OPA5 integration testing for user workflows
- Create end-to-end testing with modern tools
- Build test automation and CI/CD integration
- Achieve comprehensive test coverage

## 1. Conceptual Foundation (30 minutes)

### Testing Pyramid for UI5 Applications

**Testing Levels:**
- **Unit Tests (70%)**: Individual functions and components
- **Integration Tests (20%)**: Component interactions and workflows
- **E2E Tests (10%)**: Complete user scenarios

**Testing Benefits:**
- **Quality Assurance**: Catch bugs early
- **Regression Prevention**: Ensure changes don't break existing functionality
- **Documentation**: Tests serve as living documentation
- **Confidence**: Safe refactoring and deployment

### Current Testing State Analysis

Your project currently lacks comprehensive testing. This module will add:
- Unit tests for controllers and models
- Integration tests for user workflows
- E2E tests for critical paths
- Test automation pipeline

## 2. Hands-On Implementation (150 minutes)

### Exercise 1: QUnit Unit Testing Setup (50 minutes)

**Test Infrastructure Setup:**
```javascript
// webapp/test/unit/unitTests.qunit.html
<!DOCTYPE html>
<html>
<head>
    <title>Unit Tests - Product Management App</title>
    <meta charset="utf-8">
    
    <script src="../../../resources/sap-ui-core.js"
        data-sap-ui-resourceroots='{
            "com.productapp": "../../",
            "com.productapp.test": "./"
        }'
        data-sap-ui-async="true">
    </script>
    
    <link rel="stylesheet" type="text/css" href="../../../resources/sap/ui/thirdparty/qunit-2.css">
    <script src="../../../resources/sap/ui/thirdparty/qunit-2.js"></script>
    <script src="../../../resources/sap/ui/qunit/qunit-junit.js"></script>
    <script src="../../../resources/sap/ui/qunit/qunit-coverage.js"></script>
    
    <script src="AllTests.js"></script>
</head>
<body>
    <div id="qunit"></div>
    <div id="qunit-fixture"></div>
</body>
</html>
```

**Test Suite Configuration:**
```javascript
// webapp/test/unit/AllTests.js
sap.ui.define([
    "com/productapp/test/unit/controller/Master.controller.test",
    "com/productapp/test/unit/controller/Detail.controller.test",
    "com/productapp/test/unit/model/formatter.test",
    "com/productapp/test/unit/service/ValidationService.test"
], function() {
    "use strict";
});
```

**Controller Unit Tests:**
```javascript
// webapp/test/unit/controller/Master.controller.test.js
sap.ui.define([
    "com/productapp/controller/Master.controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/View",
    "sap/ui/thirdparty/sinon",
    "sap/ui/thirdparty/sinon-qunit"
], function(MasterController, JSONModel, View) {
    "use strict";

    QUnit.module("Master Controller", {
        beforeEach: function() {
            this.oController = new MasterController();
            this.oViewStub = new View();
            
            // Mock view methods
            this.oViewStub.byId = sinon.stub();
            this.oViewStub.getModel = sinon.stub();
            this.oViewStub.setModel = sinon.stub();
            
            // Mock controller methods
            this.oController.getView = sinon.stub().returns(this.oViewStub);
            this.oController.getOwnerComponent = sinon.stub().returns({
                getRouter: sinon.stub().returns({
                    navTo: sinon.stub(),
                    getRoute: sinon.stub().returns({
                        attachPatternMatched: sinon.stub()
                    })
                }),
                getModel: sinon.stub().returns(new JSONModel())
            });
        },
        
        afterEach: function() {
            this.oController.destroy();
            sinon.restore();
        }
    });

    QUnit.test("Should initialize controller correctly", function(assert) {
        // Arrange
        var oModel = new JSONModel([
            { ProductID: "1", Name: "Test Product" }
        ]);
        this.oViewStub.getModel.withArgs("products").returns(oModel);
        
        // Act
        this.oController.onInit();
        
        // Assert
        assert.ok(this.oController.getView.called, "getView was called");
        assert.ok(this.oController.getOwnerComponent.called, "getOwnerComponent was called");
    });

    QUnit.test("Should handle search correctly", function(assert) {
        // Arrange
        var oEvent = {
            getParameter: sinon.stub().returns("test query")
        };
        var oList = {
            getBinding: sinon.stub().returns({
                filter: sinon.spy()
            })
        };
        this.oViewStub.byId.withArgs("productList").returns(oList);
        
        // Act
        this.oController.onSearch(oEvent);
        
        // Assert
        assert.ok(oEvent.getParameter.calledWith("query"), "Event parameter was read");
        assert.ok(oList.getBinding.called, "List binding was accessed");
    });

    QUnit.test("Should navigate on selection change", function(assert) {
        // Arrange
        var oRouter = {
            navTo: sinon.spy()
        };
        this.oController.getOwnerComponent().getRouter.returns(oRouter);
        
        var oContext = {
            getProperty: sinon.stub().withArgs("ProductID").returns("123")
        };
        var oItem = {
            getBindingContext: sinon.stub().returns(oContext)
        };
        var oEvent = {
            getParameter: sinon.stub().withArgs("listItem").returns(oItem),
            getSource: sinon.stub().returns(oItem)
        };
        
        // Act
        this.oController.onSelectionChange(oEvent);
        
        // Assert
        assert.ok(oRouter.navTo.calledWith("detail", { productId: "123" }), 
                 "Navigation was triggered with correct parameters");
    });
});
```

**Formatter Unit Tests:**
```javascript
// webapp/test/unit/model/formatter.test.js
sap.ui.define([
    "com/productapp/model/formatter"
], function(formatter) {
    "use strict";

    QUnit.module("Formatter Functions");

    QUnit.test("formatPrice should format price correctly", function(assert) {
        // Test with valid price and currency
        var sResult = formatter.formatPrice(1299.99, "USD");
        assert.ok(sResult.includes("1,299.99"), "Price formatted correctly");
        assert.ok(sResult.includes("USD"), "Currency included");
        
        // Test with null price
        var sNullResult = formatter.formatPrice(null, "USD");
        assert.strictEqual(sNullResult, "", "Null price returns empty string");
        
        // Test with zero price
        var sZeroResult = formatter.formatPrice(0, "USD");
        assert.ok(sZeroResult.includes("0"), "Zero price formatted correctly");
    });

    QUnit.test("formatStockStatus should return correct status", function(assert) {
        // Test in stock scenarios
        assert.strictEqual(formatter.formatStockStatus(true, 100), "In Stock");
        assert.strictEqual(formatter.formatStockStatus(true, 25), "Limited Stock");
        assert.strictEqual(formatter.formatStockStatus(true, 5), "Low Stock");
        
        // Test out of stock scenarios
        assert.strictEqual(formatter.formatStockStatus(false, 0), "Out of Stock");
        assert.strictEqual(formatter.formatStockStatus(true, 0), "Out of Stock");
    });

    QUnit.test("formatRating should format rating with stars", function(assert) {
        var sResult = formatter.formatRating(4.5);
        assert.ok(sResult.includes("★"), "Contains star symbols");
        assert.ok(sResult.includes("4.5"), "Contains rating value");
        
        var sEmptyResult = formatter.formatRating(null);
        assert.strictEqual(sEmptyResult, "", "Null rating returns empty string");
    });
});
```

### Exercise 2: OPA5 Integration Testing (50 minutes)

**OPA5 Test Setup:**
```javascript
// webapp/test/integration/AllJourneys.js
sap.ui.define([
    "sap/ui/test/Opa5",
    "./arrangements/Startup",
    "./MasterJourney",
    "./DetailJourney",
    "./CreateJourney"
], function(Opa5, Startup) {
    "use strict";

    Opa5.extendConfig({
        arrangements: new Startup(),
        viewNamespace: "com.productapp.view.",
        autoWait: true,
        timeout: 15,
        pollingInterval: 400
    });
});
```

**Page Objects Pattern:**
```javascript
// webapp/test/integration/pages/Master.js
sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/matchers/AggregationLengthEquals",
    "sap/ui/test/matchers/PropertyStrictEquals",
    "sap/ui/test/actions/Press"
], function(Opa5, AggregationLengthEquals, PropertyStrictEquals, Press) {
    "use strict";

    var sViewName = "Master";

    Opa5.createPageObjects({
        onTheMasterPage: {
            actions: {
                iPressOnTheFirstListItem: function() {
                    return this.waitFor({
                        id: "productList",
                        viewName: sViewName,
                        actions: new Press(),
                        matchers: function(oList) {
                            return oList.getItems()[0];
                        },
                        errorMessage: "The first list item was not pressable"
                    });
                },

                iSearchForProduct: function(sSearchTerm) {
                    return this.waitFor({
                        id: "searchField",
                        viewName: sViewName,
                        actions: function(oSearchField) {
                            oSearchField.setValue(sSearchTerm);
                            oSearchField.fireSearch({ query: sSearchTerm });
                        },
                        errorMessage: "Could not search for product"
                    });
                }
            },

            assertions: {
                iShouldSeeTheProductList: function() {
                    return this.waitFor({
                        id: "productList",
                        viewName: sViewName,
                        success: function(oList) {
                            Opa5.assert.ok(oList, "The product list is displayed");
                        },
                        errorMessage: "The product list was not displayed"
                    });
                },

                theListShouldHaveItems: function(iExpectedCount) {
                    return this.waitFor({
                        id: "productList",
                        viewName: sViewName,
                        matchers: new AggregationLengthEquals({
                            name: "items",
                            length: iExpectedCount
                        }),
                        success: function() {
                            Opa5.assert.ok(true, "The list has " + iExpectedCount + " items");
                        },
                        errorMessage: "The list does not have " + iExpectedCount + " items"
                    });
                },

                iShouldSeeSearchResults: function() {
                    return this.waitFor({
                        id: "productList",
                        viewName: sViewName,
                        check: function(oList) {
                            return oList.getItems().length > 0;
                        },
                        success: function() {
                            Opa5.assert.ok(true, "Search results are displayed");
                        },
                        errorMessage: "No search results found"
                    });
                }
            }
        }
    });
});
```

**User Journey Tests:**
```javascript
// webapp/test/integration/MasterJourney.js
sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/Master",
    "./pages/Detail"
], function(opaTest) {
    "use strict";

    QUnit.module("Master Page");

    opaTest("Should see the product list on startup", function(Given, When, Then) {
        // Arrangements
        Given.iStartMyApp();

        // Actions
        When.onTheMasterPage.iLookAtTheScreen();

        // Assertions
        Then.onTheMasterPage.iShouldSeeTheProductList();
        Then.onTheMasterPage.theListShouldHaveItems(10);
    });

    opaTest("Should be able to search for products", function(Given, When, Then) {
        // Actions
        When.onTheMasterPage.iSearchForProduct("Laptop");

        // Assertions
        Then.onTheMasterPage.iShouldSeeSearchResults();
    });

    opaTest("Should navigate to detail page when item is pressed", function(Given, When, Then) {
        // Actions
        When.onTheMasterPage.iPressOnTheFirstListItem();

        // Assertions
        Then.onTheDetailPage.iShouldSeeTheProductDetails();
        
        // Cleanup
        Then.iTeardownMyApp();
    });
});
```

### Exercise 3: End-to-End Testing with Playwright (50 minutes)

**E2E Test Setup:**
```javascript
// tests/e2e/playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:8080',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] }
        }
    ],
    webServer: {
        command: 'npm start',
        port: 8080,
        reuseExistingServer: !process.env.CI
    }
});
```

**E2E Test Implementation:**
```javascript
// tests/e2e/product-management.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Product Management Application', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should display product list on startup', async ({ page }) => {
        // Check if the product list is visible
        await expect(page.locator('[id*="productList"]')).toBeVisible();
        
        // Check if products are loaded
        const productItems = page.locator('[id*="productList"] .sapMLIB');
        await expect(productItems).toHaveCountGreaterThan(0);
        
        // Check if first product has expected structure
        const firstProduct = productItems.first();
        await expect(firstProduct.locator('.sapMObjLTitle')).toBeVisible();
        await expect(firstProduct.locator('.sapMObjLNumber')).toBeVisible();
    });

    test('should search for products', async ({ page }) => {
        // Enter search term
        const searchField = page.locator('[id*="searchField"] input');
        await searchField.fill('Laptop');
        await searchField.press('Enter');
        
        // Wait for search results
        await page.waitForTimeout(500);
        
        // Verify search results
        const productItems = page.locator('[id*="productList"] .sapMLIB');
        const itemCount = await productItems.count();
        expect(itemCount).toBeGreaterThan(0);
        
        // Verify search term appears in results
        const firstProductTitle = await productItems.first().locator('.sapMObjLTitle').textContent();
        expect(firstProductTitle.toLowerCase()).toContain('laptop');
    });

    test('should navigate to product detail', async ({ page }) => {
        // Click on first product
        const firstProduct = page.locator('[id*="productList"] .sapMLIB').first();
        await firstProduct.click();
        
        // Wait for navigation
        await page.waitForLoadState('networkidle');
        
        // Verify detail page is displayed
        await expect(page.locator('[id*="objectHeader"]')).toBeVisible();
        await expect(page.locator('[id*="iconTabBar"]')).toBeVisible();
        
        // Verify product information is displayed
        const productTitle = page.locator('[id*="objectHeader"] .sapMOHTitle');
        await expect(productTitle).toBeVisible();
        await expect(productTitle).not.toBeEmpty();
    });

    test('should create new product', async ({ page }) => {
        // Navigate to create page
        await page.locator('button:has-text("Add Product")').click();
        
        // Fill product form
        await page.locator('[id*="nameInput"] input').fill('Test Product E2E');
        await page.locator('[id*="descriptionInput"] textarea').fill('Test product created by E2E test');
        await page.locator('[id*="priceInput"] input').fill('999.99');
        
        // Select category
        await page.locator('[id*="categoryCombo"]').click();
        await page.locator('li:has-text("Electronics")').click();
        
        // Save product
        await page.locator('button:has-text("Save")').click();
        
        // Verify success message
        await expect(page.locator('.sapMMessageToast')).toBeVisible();
        
        // Verify navigation back to list
        await expect(page.locator('[id*="productList"]')).toBeVisible();
        
        // Verify new product appears in list
        const newProduct = page.locator('.sapMObjLTitle:has-text("Test Product E2E")');
        await expect(newProduct).toBeVisible();
    });

    test('should handle errors gracefully', async ({ page }) => {
        // Simulate network error by intercepting requests
        await page.route('**/api/**', route => route.abort());
        
        // Try to perform an action that requires network
        await page.locator('button:has-text("Refresh")').click();
        
        // Verify error handling
        await expect(page.locator('.sapMMessageBox')).toBeVisible();
        await expect(page.locator('text=network error')).toBeVisible();
    });
});
```

## 3. Practical Exercises (60 minutes)

### Challenge 1: Test Coverage Analysis (20 minutes)
Achieve 90%+ code coverage with meaningful tests

### Challenge 2: Performance Testing (20 minutes)
Create tests that verify performance requirements

### Challenge 3: CI/CD Integration (20 minutes)
Set up automated testing pipeline

## 4. Integration with Official Resources

### UI5 SDK References
- **QUnit Testing**: https://ui5.sap.com/topic/09d145cd86ee4f8e9d08715f1b364c51
- **OPA5 Testing**: https://ui5.sap.com/topic/2696ab50faad458f9b4027ec2f9b884d

## Module Assessment

**Knowledge Check:**
1. Write comprehensive unit tests
2. Create integration test scenarios
3. Implement E2E testing workflows
4. Set up test automation pipeline

**Practical Assessment:**
1. Achieve 90% test coverage
2. Create complete test suite
3. Implement CI/CD testing
4. Build performance test scenarios

## Next Module Preview

**Module 14: Accessibility (WCAG) & Internationalization (i18n)**
- WCAG 2.1 AA compliance implementation
- Screen reader optimization and keyboard navigation
- Multi-language support and localization
- Cultural adaptation and RTL support

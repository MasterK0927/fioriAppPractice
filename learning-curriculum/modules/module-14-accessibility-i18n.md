# Module 14: Accessibility (WCAG) & Internationalization (i18n)

**Duration**: 2.5-3 hours | **Level**: Advanced | **Prerequisites**: Modules 1-13 completed

## Learning Objectives

By the end of this module, you will:
- Implement WCAG 2.1 AA compliance standards
- Optimize for screen readers and keyboard navigation
- Create comprehensive multi-language support
- Handle cultural adaptation and RTL languages
- Build inclusive user experiences

## 1. Conceptual Foundation (25 minutes)

### Accessibility Standards and Requirements

**WCAG 2.1 AA Compliance:**
- **Perceivable**: Information must be presentable to users in ways they can perceive
- **Operable**: Interface components must be operable by all users
- **Understandable**: Information and UI operation must be understandable
- **Robust**: Content must be robust enough for various assistive technologies

**Current Accessibility State:**
Your project uses UI5 controls which provide basic accessibility, but needs enhancement for:
- Custom ARIA labels and descriptions
- Keyboard navigation optimization
- Screen reader announcements
- High contrast support

### Internationalization Requirements

**i18n Implementation Needs:**
- Text externalization and translation
- Date, number, and currency formatting
- Cultural adaptations
- RTL language support
- Locale-specific business logic

## 2. Hands-On Implementation (90 minutes)

### Exercise 1: WCAG Compliance Implementation (30 minutes)

**Accessibility Service:**
```javascript
// webapp/service/AccessibilityService.js
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/Core"
], function(BaseObject, Core) {
    "use strict";
    
    return BaseObject.extend("com.productapp.service.AccessibilityService", {
        
        constructor: function() {
            this._setupAccessibilityFeatures();
            this._setupKeyboardNavigation();
        },
        
        _setupAccessibilityFeatures: function() {
            // Enable high contrast detection
            this._detectHighContrast();
            
            // Setup focus management
            this._setupFocusManagement();
            
            // Setup screen reader announcements
            this._setupScreenReaderSupport();
        },
        
        _detectHighContrast: function() {
            var bHighContrast = window.matchMedia("(prefers-contrast: high)").matches;
            if (bHighContrast) {
                document.body.classList.add("high-contrast");
            }
            
            // Listen for changes
            window.matchMedia("(prefers-contrast: high)").addEventListener("change", function(e) {
                if (e.matches) {
                    document.body.classList.add("high-contrast");
                } else {
                    document.body.classList.remove("high-contrast");
                }
            });
        },
        
        _setupFocusManagement: function() {
            // Trap focus in dialogs
            document.addEventListener("keydown", function(e) {
                if (e.key === "Tab") {
                    this._handleTabNavigation(e);
                }
            }.bind(this));
        },
        
        _handleTabNavigation: function(oEvent) {
            var oActiveDialog = document.querySelector(".sapMDialog:not([aria-hidden='true'])");
            if (oActiveDialog) {
                this._trapFocusInDialog(oEvent, oActiveDialog);
            }
        },
        
        _trapFocusInDialog: function(oEvent, oDialog) {
            var aFocusableElements = oDialog.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            var oFirstElement = aFocusableElements[0];
            var oLastElement = aFocusableElements[aFocusableElements.length - 1];
            
            if (oEvent.shiftKey) {
                if (document.activeElement === oFirstElement) {
                    oLastElement.focus();
                    oEvent.preventDefault();
                }
            } else {
                if (document.activeElement === oLastElement) {
                    oFirstElement.focus();
                    oEvent.preventDefault();
                }
            }
        },
        
        _setupScreenReaderSupport: function() {
            // Create live region for announcements
            this._createLiveRegion();
        },
        
        _createLiveRegion: function() {
            var oLiveRegion = document.createElement("div");
            oLiveRegion.setAttribute("aria-live", "polite");
            oLiveRegion.setAttribute("aria-atomic", "true");
            oLiveRegion.setAttribute("class", "sapUiInvisibleText");
            oLiveRegion.setAttribute("id", "liveRegion");
            document.body.appendChild(oLiveRegion);
        },
        
        announceToScreenReader: function(sMessage, sPriority) {
            var oLiveRegion = document.getElementById("liveRegion");
            if (oLiveRegion) {
                oLiveRegion.setAttribute("aria-live", sPriority || "polite");
                oLiveRegion.textContent = sMessage;
                
                // Clear after announcement
                setTimeout(function() {
                    oLiveRegion.textContent = "";
                }, 1000);
            }
        },
        
        _setupKeyboardNavigation: function() {
            // Add keyboard shortcuts
            document.addEventListener("keydown", function(e) {
                // Alt + M for main navigation
                if (e.altKey && e.key === "m") {
                    this._focusMainNavigation();
                    e.preventDefault();
                }
                
                // Alt + S for search
                if (e.altKey && e.key === "s") {
                    this._focusSearch();
                    e.preventDefault();
                }
                
                // Escape to close dialogs
                if (e.key === "Escape") {
                    this._closeTopDialog();
                }
            }.bind(this));
        },
        
        _focusMainNavigation: function() {
            var oMainNav = document.querySelector("[role='navigation']");
            if (oMainNav) {
                oMainNav.focus();
                this.announceToScreenReader("Main navigation focused");
            }
        },
        
        _focusSearch: function() {
            var oSearchField = document.querySelector("input[type='search']");
            if (oSearchField) {
                oSearchField.focus();
                this.announceToScreenReader("Search field focused");
            }
        },
        
        _closeTopDialog: function() {
            var oDialog = document.querySelector(".sapMDialog:not([aria-hidden='true'])");
            if (oDialog) {
                var oCloseButton = oDialog.querySelector(".sapMDialogCloseButton");
                if (oCloseButton) {
                    oCloseButton.click();
                }
            }
        },
        
        enhanceControlAccessibility: function(oControl, mOptions) {
            mOptions = mOptions || {};
            
            var oDomRef = oControl.getDomRef();
            if (!oDomRef) return;
            
            // Add ARIA label
            if (mOptions.label) {
                oDomRef.setAttribute("aria-label", mOptions.label);
            }
            
            // Add ARIA description
            if (mOptions.description) {
                var sDescId = oControl.getId() + "-desc";
                var oDescElement = document.createElement("span");
                oDescElement.id = sDescId;
                oDescElement.className = "sapUiInvisibleText";
                oDescElement.textContent = mOptions.description;
                oDomRef.appendChild(oDescElement);
                oDomRef.setAttribute("aria-describedby", sDescId);
            }
            
            // Add role if specified
            if (mOptions.role) {
                oDomRef.setAttribute("role", mOptions.role);
            }
            
            // Add keyboard support
            if (mOptions.keyboardSupport) {
                this._addKeyboardSupport(oControl, mOptions.keyboardSupport);
            }
        },
        
        _addKeyboardSupport: function(oControl, mKeyboardOptions) {
            var oDomRef = oControl.getDomRef();
            
            // Make focusable if needed
            if (mKeyboardOptions.focusable && !oDomRef.hasAttribute("tabindex")) {
                oDomRef.setAttribute("tabindex", "0");
            }
            
            // Add keyboard event handlers
            if (mKeyboardOptions.onEnter) {
                oDomRef.addEventListener("keydown", function(e) {
                    if (e.key === "Enter" || e.key === " ") {
                        mKeyboardOptions.onEnter();
                        e.preventDefault();
                    }
                });
            }
        }
    });
});
```

**Enhanced Accessible Views:**
```xml
<!-- Enhanced webapp/view/Master.view.xml with accessibility -->
<mvc:View
    controllerName="com.productapp.controller.Master"
    xmlns="sap.m"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:core="sap.ui.core">

    <Page 
        id="masterPage" 
        title="{i18n>masterTitle}"
        role="main"
        aria-label="{i18n>masterPageAriaLabel}">
        
        <customHeader>
            <Toolbar role="banner">
                <Title text="{i18n>appTitle}" level="H1"/>
                <ToolbarSpacer/>
                <Button 
                    icon="sap-icon://action-settings" 
                    press=".onSettingsPress"
                    tooltip="{i18n>settingsTooltip}"
                    ariaLabel="{i18n>settingsAriaLabel}"/>
            </Toolbar>
        </customHeader>
        
        <subHeader>
            <Toolbar role="search" ariaLabel="{i18n>searchToolbarAriaLabel}">
                <SearchField 
                    id="searchField" 
                    width="60%" 
                    search=".onSearch"
                    placeholder="{i18n>searchPlaceholder}"
                    ariaLabel="{i18n>searchAriaLabel}"
                    ariaDescribedBy="searchHelp"/>
                <core:InvisibleText 
                    id="searchHelp" 
                    text="{i18n>searchHelpText}"/>
                    
                <ComboBox 
                    id="categoryFilter" 
                    width="35%"
                    placeholder="{i18n>filterPlaceholder}"
                    items="{categories>/}"
                    selectionChange=".onCategoryFilter"
                    ariaLabel="{i18n>categoryFilterAriaLabel}">
                    <core:Item key="{categories>Name}" text="{categories>Name}"/>
                </ComboBox>
            </Toolbar>
        </subHeader>
        
        <content>
            <List 
                id="productList"
                items="{products>/}"
                mode="SingleSelectMaster"
                selectionChange=".onSelectionChange"
                role="listbox"
                ariaLabel="{i18n>productListAriaLabel}"
                ariaDescribedBy="listHelp">
                
                <core:InvisibleText 
                    id="listHelp" 
                    text="{i18n>productListHelpText}"/>
                
                <items>
                    <ObjectListItem
                        title="{products>Name}"
                        number="{
                            parts: [
                                {path: 'products>Price'},
                                {path: 'products>Currency'}
                            ],
                            formatter: '.formatter.formatPrice'
                        }"
                        intro="{products>Category}"
                        type="Active"
                        press=".onSelectionChange"
                        ariaLabel="{
                            parts: [
                                'products>Name',
                                'products>Category',
                                'products>Price',
                                'products>Currency',
                                'i18n>productItemAriaLabel'
                            ],
                            formatter: '.formatter.formatProductAriaLabel'
                        }">
                        
                        <firstStatus>
                            <ObjectStatus
                                text="{= ${products>InStock} ? ${i18n>inStock} : ${i18n>outOfStock}}"
                                state="{= ${products>InStock} ? 'Success' : 'Error'}"
                                ariaLabel="{
                                    parts: [
                                        'products>InStock',
                                        'i18n>stockStatusAriaLabel'
                                    ],
                                    formatter: '.formatter.formatStockAriaLabel'
                                }"/>
                        </firstStatus>
                        
                        <attributes>
                            <ObjectAttribute 
                                text="{products>Description}"
                                ariaLabel="{i18n>descriptionAriaLabel}: {products>Description}"/>
                        </attributes>
                    </ObjectListItem>
                </items>
            </List>
        </content>
        
        <footer>
            <Toolbar role="contentinfo">
                <Text text="{
                    parts: [
                        'view>/itemCount',
                        'i18n>itemCountText'
                    ],
                    formatter: '.formatter.formatItemCount'
                }" 
                ariaLive="polite"/>
                <ToolbarSpacer/>
                <Button 
                    icon="sap-icon://add" 
                    text="{i18n>addProduct}" 
                    type="Emphasized" 
                    press=".onAddPress"
                    ariaLabel="{i18n>addProductAriaLabel}"/>
            </Toolbar>
        </footer>
    </Page>
</mvc:View>
```

### Exercise 2: Comprehensive i18n Implementation (30 minutes)

**Enhanced i18n Resource Bundle:**
```properties
# webapp/i18n/i18n.properties (English - Default)

# Application
appTitle=Product Management
appDescription=Comprehensive product management application

# Master Page
masterTitle=Products
masterPageAriaLabel=Product list page
searchPlaceholder=Search products...
searchAriaLabel=Search for products by name, category, or description
searchHelpText=Enter search terms to filter the product list
filterPlaceholder=All Categories
categoryFilterAriaLabel=Filter products by category
productListAriaLabel=List of products
productListHelpText=Use arrow keys to navigate, Enter to select
itemCountText=products found
addProduct=Add Product
addProductAriaLabel=Create a new product

# Product Items
productItemAriaLabel=Product {0} in category {1}, priced at {2} {3}
inStock=In Stock
outOfStock=Out of Stock
stockStatusAriaLabel=Stock status
descriptionAriaLabel=Description

# Detail Page
detailTitle=Product Details
editProduct=Edit Product
deleteProduct=Delete Product
confirmDelete=Are you sure you want to delete this product?

# Form Labels
productName=Product Name
productNameRequired=Product name is required
productDescription=Description
price=Price
currency=Currency
category=Category
supplier=Supplier
inStockLabel=In Stock
quantity=Quantity
rating=Rating
releaseDate=Release Date

# Validation Messages
fieldRequired=This field is required
minLength=Minimum {0} characters required
invalidEmail=Please enter a valid email address
invalidPrice=Price must be a positive number

# Accessibility
settingsTooltip=Application settings
settingsAriaLabel=Open application settings
searchToolbarAriaLabel=Search and filter toolbar

# Success Messages
productCreated=Product created successfully
productUpdated=Product updated successfully
productDeleted=Product deleted successfully

# Error Messages
loadError=Failed to load data
saveError=Failed to save changes
deleteError=Failed to delete product
networkError=Network connection error
```

**Localization for German:**
```properties
# webapp/i18n/i18n_de.properties (German)

# Application
appTitle=Produktverwaltung
appDescription=Umfassende Produktverwaltungsanwendung

# Master Page
masterTitle=Produkte
masterPageAriaLabel=Produktlistenseite
searchPlaceholder=Produkte suchen...
searchAriaLabel=Suche nach Produkten nach Name, Kategorie oder Beschreibung
searchHelpText=Suchbegriffe eingeben, um die Produktliste zu filtern
filterPlaceholder=Alle Kategorien
categoryFilterAriaLabel=Produkte nach Kategorie filtern
productListAriaLabel=Liste der Produkte
productListHelpText=Pfeiltasten zum Navigieren, Enter zum Auswählen
itemCountText=Produkte gefunden
addProduct=Produkt hinzufügen
addProductAriaLabel=Neues Produkt erstellen

# Product Items
productItemAriaLabel=Produkt {0} in Kategorie {1}, Preis {2} {3}
inStock=Auf Lager
outOfStock=Nicht verfügbar
stockStatusAriaLabel=Lagerstatus
descriptionAriaLabel=Beschreibung

# Form Labels
productName=Produktname
productNameRequired=Produktname ist erforderlich
productDescription=Beschreibung
price=Preis
currency=Währung
category=Kategorie
supplier=Lieferant
inStockLabel=Auf Lager
quantity=Menge
rating=Bewertung
releaseDate=Veröffentlichungsdatum

# Validation Messages
fieldRequired=Dieses Feld ist erforderlich
minLength=Mindestens {0} Zeichen erforderlich
invalidEmail=Bitte geben Sie eine gültige E-Mail-Adresse ein
invalidPrice=Preis muss eine positive Zahl sein

# Success Messages
productCreated=Produkt erfolgreich erstellt
productUpdated=Produkt erfolgreich aktualisiert
productDeleted=Produkt erfolgreich gelöscht

# Error Messages
loadError=Fehler beim Laden der Daten
saveError=Fehler beim Speichern der Änderungen
deleteError=Fehler beim Löschen des Produkts
networkError=Netzwerkverbindungsfehler
```

**i18n Service for Dynamic Localization:**
```javascript
// webapp/service/I18nService.js
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/resource/ResourceModel",
    "sap/base/i18n/Localization"
], function(BaseObject, ResourceModel, Localization) {
    "use strict";
    
    return BaseObject.extend("com.productapp.service.I18nService", {
        
        constructor: function(oComponent) {
            this._oComponent = oComponent;
            this._sCurrentLanguage = Localization.getLanguage();
            this._setupLanguageDetection();
        },
        
        _setupLanguageDetection: function() {
            // Detect user's preferred language
            var sUserLanguage = this._detectUserLanguage();
            if (sUserLanguage !== this._sCurrentLanguage) {
                this.setLanguage(sUserLanguage);
            }
        },
        
        _detectUserLanguage: function() {
            // Check URL parameter
            var oUrlParams = new URLSearchParams(window.location.search);
            var sUrlLang = oUrlParams.get("lang");
            if (sUrlLang) {
                return sUrlLang;
            }
            
            // Check localStorage
            var sStoredLang = localStorage.getItem("userLanguage");
            if (sStoredLang) {
                return sStoredLang;
            }
            
            // Use browser language
            return navigator.language.split("-")[0];
        },
        
        setLanguage: function(sLanguage) {
            this._sCurrentLanguage = sLanguage;
            
            // Store preference
            localStorage.setItem("userLanguage", sLanguage);
            
            // Update UI5 locale
            Localization.setLanguage(sLanguage);
            
            // Reload i18n model
            this._reloadI18nModel();
            
            // Update page direction for RTL languages
            this._updatePageDirection(sLanguage);
        },
        
        _reloadI18nModel: function() {
            var oI18nModel = new ResourceModel({
                bundleName: "com.productapp.i18n.i18n",
                supportedLocales: ["", "de", "fr", "es", "ar"],
                fallbackLocale: ""
            });
            
            this._oComponent.setModel(oI18nModel, "i18n");
        },
        
        _updatePageDirection: function(sLanguage) {
            var bRTL = this._isRTLLanguage(sLanguage);
            
            // Update document direction
            document.dir = bRTL ? "rtl" : "ltr";
            document.documentElement.setAttribute("dir", bRTL ? "rtl" : "ltr");
            
            // Update UI5 RTL configuration
            sap.ui.getCore().getConfiguration().setRTL(bRTL);
        },
        
        _isRTLLanguage: function(sLanguage) {
            var aRTLLanguages = ["ar", "he", "fa", "ur"];
            return aRTLLanguages.includes(sLanguage);
        },
        
        getCurrentLanguage: function() {
            return this._sCurrentLanguage;
        },
        
        getSupportedLanguages: function() {
            return [
                { key: "en", text: "English" },
                { key: "de", text: "Deutsch" },
                { key: "fr", text: "Français" },
                { key: "es", text: "Español" },
                { key: "ar", text: "العربية" }
            ];
        },
        
        formatMessage: function(sKey, aParams) {
            var oResourceBundle = this._oComponent.getModel("i18n").getResourceBundle();
            return oResourceBundle.getText(sKey, aParams);
        }
    });
});
```

### Exercise 3: Cultural Adaptation and RTL Support (30 minutes)

**RTL-Aware CSS:**
```css
/* webapp/css/style.css */

/* RTL-specific styles */
[dir="rtl"] .custom-margin-left {
    margin-left: 0;
    margin-right: 1rem;
}

[dir="rtl"] .custom-margin-right {
    margin-right: 0;
    margin-left: 1rem;
}

[dir="rtl"] .custom-float-left {
    float: right;
}

[dir="rtl"] .custom-float-right {
    float: left;
}

/* High contrast support */
.high-contrast .sapMBtn {
    border: 2px solid !important;
}

.high-contrast .sapMInputBase {
    border: 2px solid !important;
}

/* Focus indicators */
.sapMBtn:focus,
.sapMInputBase:focus {
    outline: 3px solid #005fcc;
    outline-offset: 2px;
}

/* Screen reader only content */
.sapUiInvisibleText {
    position: absolute !important;
    clip: rect(1px, 1px, 1px, 1px);
    padding: 0 !important;
    border: 0 !important;
    height: 1px !important;
    width: 1px !important;
    overflow: hidden;
}
```

**Cultural Formatting Service:**
```javascript
// webapp/service/CultureService.js
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/format/DateFormat"
], function(BaseObject, NumberFormat, DateFormat) {
    "use strict";
    
    return BaseObject.extend("com.productapp.service.CultureService", {
        
        constructor: function() {
            this._setupCulturalFormatters();
        },
        
        _setupCulturalFormatters: function() {
            this._oCurrencyFormatter = NumberFormat.getCurrencyInstance();
            this._oDateFormatter = DateFormat.getDateInstance();
            this._oTimeFormatter = DateFormat.getTimeInstance();
        },
        
        formatCurrency: function(fAmount, sCurrency, sLocale) {
            var oFormatter = NumberFormat.getCurrencyInstance({
                currencyCode: sCurrency
            }, sLocale);
            return oFormatter.format(fAmount, sCurrency);
        },
        
        formatDate: function(oDate, sLocale) {
            var oFormatter = DateFormat.getDateInstance({
                style: "medium"
            }, sLocale);
            return oFormatter.format(oDate);
        },
        
        formatNumber: function(fNumber, sLocale) {
            var oFormatter = NumberFormat.getFloatInstance({}, sLocale);
            return oFormatter.format(fNumber);
        },
        
        getCulturalSettings: function(sLocale) {
            var mSettings = {
                "en": {
                    dateFormat: "MM/dd/yyyy",
                    timeFormat: "12h",
                    numberSeparator: ",",
                    decimalSeparator: ".",
                    currencyPosition: "before"
                },
                "de": {
                    dateFormat: "dd.MM.yyyy",
                    timeFormat: "24h",
                    numberSeparator: ".",
                    decimalSeparator: ",",
                    currencyPosition: "after"
                },
                "ar": {
                    dateFormat: "dd/MM/yyyy",
                    timeFormat: "12h",
                    numberSeparator: "٬",
                    decimalSeparator: "٫",
                    currencyPosition: "before",
                    direction: "rtl"
                }
            };
            
            return mSettings[sLocale] || mSettings["en"];
        }
    });
});
```

## 3. Practical Exercises (60 minutes)

### Challenge 1: Screen Reader Optimization (20 minutes)
Test and optimize the application with screen readers

### Challenge 2: Keyboard Navigation Enhancement (20 minutes)
Implement comprehensive keyboard shortcuts and navigation

### Challenge 3: Multi-Language Testing (20 minutes)
Test application in different languages and cultures

## 4. Integration with Official Resources

### UI5 SDK References
- **Accessibility**: https://ui5.sap.com/topic/322f55d0cf1e4b459cc1f22298ec12a5
- **Internationalization**: https://ui5.sap.com/topic/91f217c46f4d1014b6dd926db0e91070

## Module Assessment

**Knowledge Check:**
1. Implement WCAG 2.1 AA compliance
2. Create comprehensive i18n support
3. Handle RTL languages and cultural adaptation
4. Optimize for assistive technologies

**Practical Assessment:**
1. Pass accessibility audit tools
2. Support multiple languages
3. Implement keyboard navigation
4. Test with screen readers

## Next Module Preview

**Module 15: Deployment, Security & Production Readiness**
- Production build optimization and deployment strategies
- Security implementation and vulnerability assessment
- Monitoring, logging, and performance tracking
- DevOps integration and CI/CD pipelines

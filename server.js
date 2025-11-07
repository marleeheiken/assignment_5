// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const app = express();
const port = 3000;
const { body, validationResult } = require('express-validator');

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

  // Log request body for POST and PUT requests
  if (req.method === 'POST' || req.method === 'PUT') {
       console.log('Request Body:',
 JSON.stringify(req.body, null, 2));
}

  next(); // Pass control to next middleware
};

// Complete validation rules for menu
const menuValidation = [
  body('name')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),

  body('description')
    .isString()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),

  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a number greater than 0'),

  body('category')
    .isString()
    .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
    .withMessage('Category must be one of: appetizer, entree, dessert, or beverage'),

  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('Ingredients must be an array with at least one ingredient'),

  body('available')
    .optional() // since it defaults to true if not provided
    .isBoolean()
    .withMessage('Available must be true or false')
];


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      const errorMessages =
  errors.array().map(error => error.msg);
  
      return res.status(400).json({
          error: 'Validation failed',
          messages: errorMessages
      });
  }

  // Set default value for completed if not provided
  if (req.body.completed === undefined) {
      req.body.completed = false;
  }

  next();
};

// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Define routes and implement middleware here


// Middleware to parse JSON requests
app.use(express.json());
// Custom logging middleware
app.use(requestLogger);

// Only start server when running directly, not when testing
if (require.main === module) {
    app.listen(port, () => {
         console.log(`API server running at http://localhost:${port}`);
    });
}

// Create your REST API here with the following endpoints:

// Root endpoint - API homepage
app.get('/', (req, res) => {
    res.json({ 
        message: "Welcome to the menuItem API", 
        endpoints: { 
            "GET /menuItems": "Get all menuItems", 
            "GET /menuItems/:id": "Get a specific menuItem by ID" 
        } 
    }); 
});

// GET /menuItems - Return all menuItems
app.get('/menuItems', (req, res) => {
    // Sends back the menuItems as JSON as the response to the request
    res.json(menuItems);
});

// GET /menuItems/:id - Return a specific menuItem by ID
app.get('/menuItems/:id', (req, res) => {
    const menuItemID = parseInt(req.params.id);
    const menuItem = menuItems.find(m => m.id === menuItemID);
  
	// Return menuItem if it is found
    if (menuItem) {
        res.json(menuItem);
    } else {
        res.status(404).json({ error: 'menuItem not found' });
    }
  
});

app.post('/menuItems', menuValidation, handleValidationErrors, (req, res) => {

    // Extract data from request body
    const { name, description, price, category, ingredients, available } = req.body;

  	// Create new menuItem with generated ID
    const newMenuItem = {
        id: menuItems.length + 1,
        name,
        description,
        price,
        category, 
        ingredients, 
        available
    };
  
    // Add to menuItems array
    menuItems.push(newMenuItem);
  
    // Return the created menuItem with 201 status
    res.status(201).json(newMenuItem);
});

// PUT /menuItems/:id - Update an existing menuItems
app.put('/menuItems/:id', menuValidation, handleValidationErrors, (req, res) => {
    const menuItemID = parseInt(req.params.id);
    const { name, description, price, category, ingredients, available } = req.body;
  
    // Find the menuItem to update
    const menuItemIndex = menuItems.findIndex(m => m.id === menuItemID);
  
    if (menuItemIndex === -1) {
          return res.status(404).json({ error: 'menu item not found' });
    }
  
    // Update the menuItem
    menuItems[menuItemIndex] = {
        id: menuItemID,
        name,
        description,
        price,
        category, 
        ingredients, 
        available
    };
  
    // Return the updated menuItem
    res.json(menuItems[menuItemIndex]);
});

// DELETE /menuItems/:id - Delete a movie
app.delete('/menuItems/:id', (req, res) => {
    const menuItemID = parseInt(req.params.id);
  
    // Find the menuItem index
    const menuItemIndex = menuItems.findIndex(m => m.id === menuItemID);
  
    if (menuItemIndex === -1) {
        return res.status(404).json({ error: 'menu item not found' });
    }
  
    // Remove the menuItem from array
    const deletedMenuItem = menuItems.splice(menuItemIndex, 1)[0];
  
    // Return the deleted menuItem
    res.json({ message: 'menu item deleted successfully', menuItem: deletedMenuItem });
});








module.exports = app;
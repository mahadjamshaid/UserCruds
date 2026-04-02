const userService = require('./user.service');

// CREATE: POST /api/users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, age, password } = req.body;

    // Minimum validation
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await userService.createUser(name, email, age, password);
    
    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (err) {
    next(err); // Pass down to error middleware
  }
};

// READ ALL: GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

// READ ONE: GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Quick validation to prevent non-integers if necessary
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

// UPDATE: PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, age, password } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const user = await userService.updateUser(id, name, email, age, password);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE: DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const user = await userService.deleteUser(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'User deleted successfully', 
      user 
    });
  } catch (err) {
    next(err);
  }
};

const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');

/**
 * CREATE: Add a new user
 */
exports.createUser = async (name, email, age, password) => {
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return await prisma.user.create({
    data: {
      name,
      email,
      age: age ? parseInt(age) : null,
      password: hashedPassword,
    },
  });
};

/**
 * READ ALL: Return the list of all users
 */
exports.getAllUsers = async () => {
  return await prisma.user.findMany({
    orderBy: {
      created_at: 'desc',
    },
  });
};

/**
 * READ ONE: Get user by ID
 */
exports.getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: {
      id: parseInt(id),
    },
  });
};

/**
 * UPDATE: Update user by ID
 */
exports.updateUser = async (id, name, email, age, password) => {
  try {
    const updateData = {
      name,
      email,
      age: age ? parseInt(age) : null,
    };

    // Only update and hash the password if it's provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    return await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
    });
  } catch (err) {
    // P2025 is the Prisma error code for 'Record to update not found'
    if (err.code === 'P2025') {
      return null;
    }
    throw err;
  }
};

/**
 * DELETE: Remove user by ID
 */
exports.deleteUser = async (id) => {
  const result = await prisma.user.deleteMany({
    where: {
      id: parseInt(id),
    },
  });

  // deleteMany returns { count: numDeleted }
  return result.count > 0 ? { id } : null;
};

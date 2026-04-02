const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');

/**
 * Register a new user
 */
exports.register = async (userData) => {
    const { name, email, password, age } = userData;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Use Prisma to create the user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            age: age ? parseInt(age) : null,
        },
    });

    // Remove password from returned object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

/**
 * Login user and return JWT
 */
exports.login = async (email, password) => {
    // Find user by email with Prisma
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return null;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return null;
    }

    // Generate JWT
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    // Don't return password in user object
    const { password: _, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        token,
    };
};

/**
 * Check if email exists
 */
exports.getUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email },
    });
};

/**
 * FORGOT PASSWORD: Create a reset token
 */
exports.forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    // Generate a secure 32-char hex token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
        where: { id: user.id },
        data: {
            reset_password_token: resetToken,
            reset_password_expires: resetExpires,
        }
    });

    return resetToken;
};

/**
 * RESET PASSWORD: Confirm and change password via token
 */
exports.resetPassword = async (token, newPassword) => {
    const user = await prisma.user.findFirst({
        where: {
            reset_password_token: token,
            reset_password_expires: { gt: new Date() },
        }
    });

    if (!user) return null;

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null,
        }
    });

    return true;
};

/**
 * CHANGE PASSWORD: Update password while logged in
 */
exports.changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    // Verify current password first
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return false;

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    return true;
};

/**
 * CHANGE EMAIL: Update email while logged in
 */
exports.changeEmail = async (userId, currentPassword, newEmail) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    // Extra security: Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return false;

    await prisma.user.update({
        where: { id: userId },
        data: { email: newEmail }
    });

    return true;
};

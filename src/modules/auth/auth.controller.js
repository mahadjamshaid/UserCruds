const authService = require('./auth.service');

/**
 * Handle user registration
 */
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, age } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Name, email, and password are required' 
            });
        }

        // Check if user already exists
        const existingUser = await authService.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ 
                message: 'User with this email already exists' 
            });
        }

        const user = await authService.register({ name, email, password, age });

        res.status(201).json({
            message: 'User registered successfully',
            user
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Handle user login
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        const result = await authService.login(email, password);

        if (!result) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        res.status(200).json({
            message: 'Login successful',
            user: result.user,
            token: result.token
        });
    } catch (err) {
        next(err);
    }
};

/**
 * FORGOT PASSWORD
 */
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const token = await authService.forgotPassword(email);

        // For development, we return the token in the response.
        // In production, you would send this via email.
        res.status(200).json({
            message: 'If a user with that email exists, a reset token has been generated.',
            resetToken: token // 🛠️ Copy this token for the reset-password endpoint
        });
    } catch (err) {
        next(err);
    }
};

/**
 * RESET PASSWORD
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        const success = await authService.resetPassword(token, newPassword);
        if (!success) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
    } catch (err) {
        next(err);
    }
};

/**
 * CHANGE PASSWORD (Logged in)
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required' });
        }

        const success = await authService.changePassword(userId, currentPassword, newPassword);
        if (success === null) return res.status(404).json({ message: 'User not found' });
        if (success === false) return res.status(401).json({ message: 'Incorrect current password' });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        next(err);
    }
};

/**
 * CHANGE EMAIL (Logged in)
 */
exports.changeEmail = async (req, res, next) => {
    try {
        const { currentPassword, newEmail } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newEmail) {
            return res.status(400).json({ message: 'Current password and new email are required' });
        }

        const success = await authService.changeEmail(userId, currentPassword, newEmail);
        if (success === null) return res.status(404).json({ message: 'User not found' });
        if (success === false) return res.status(401).json({ message: 'Incorrect current password' });

        res.status(200).json({ message: 'Email updated successfully', newEmail });
    } catch (err) {
        next(err);
    }
};

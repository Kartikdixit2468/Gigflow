import { verifyAccessToken, verifyRefreshToken, generateAccessToken, setTokenCookies } from '../utils/jwt.js';
import User from '../models/User.model.js';

export const authenticate = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    // Check if access token exists and is valid
    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      
      if (decoded) {
        const user = await User.findById(decoded.userId).select('-password -refreshToken');
        
        if (!user) {
          return res.status(401).json({ 
            success: false, 
            message: 'User not found' 
          });
        }
        
        req.user = user;
        return next();
      }
    }

    // Access token invalid/expired, try refresh token
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      
      if (decoded) {
        const user = await User.findById(decoded.userId).select('+refreshToken -password');
        
        if (!user || user.refreshToken !== refreshToken) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid refresh token' 
          });
        }
        
        // Generate new access token
        const newAccessToken = generateAccessToken(user._id);
        
        // Set new access token cookie
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000
        });
        
        req.user = user;
        return next();
      }
    }

    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error',
      error: error.message 
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      
      if (decoded) {
        const user = await User.findById(decoded.userId).select('-password -refreshToken');
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

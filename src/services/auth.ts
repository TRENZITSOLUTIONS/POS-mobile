// src/services/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from '../database/schema';
import API from './api';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

export interface AuthData {
  token: string;
  user_id: string;
  username: string;
  vendor_id?: string;
  business_name?: string;
}

// ==================== TOKEN MANAGEMENT ====================

export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
    throw error;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove auth token:', error);
  }
};

// ==================== USER DATA ====================

export const saveUserData = async (userData: AuthData): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    
    // Save to database
    const db = getDatabase();
    const now = new Date().toISOString();
    
    db.execute(
      'DELETE FROM auth'
    );
    
    db.execute(
      `INSERT INTO auth (token, user_id, username, vendor_id, business_name, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.token,
        userData.user_id,
        userData.username,
        userData.vendor_id || null,
        userData.business_name || null,
        now,
        now,
      ]
    );
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
};

export const getUserData = async (): Promise<AuthData | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};

export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
    
    // Remove from database
    const db = getDatabase();
    db.execute('DELETE FROM auth');
  } catch (error) {
    console.error('Failed to remove user data:', error);
  }
};

// ==================== AUTH ACTIONS ====================

export const login = async (
  username: string,
  password: string
): Promise<{ success: boolean; error?: string; data?: AuthData }> => {
  try {
    const response = await API.auth.login(username, password);
    
    // API now returns vendor object with id, business_name, gst_no
    const authData: AuthData = {
      token: response.token,
      user_id: response.user_id.toString(),
      username: response.username,
      vendor_id: response.vendor?.id || null,
      business_name: response.vendor?.business_name || null,
    };
    
    await saveAuthToken(response.token);
    await saveUserData(authData);
    
    return { success: true, data: authData };
  } catch (error: any) {
    console.error('Login failed:', error);
    
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = 'Your vendor account is pending approval. Please wait for admin approval.';
      } else if (error.response.status === 401) {
        errorMessage = 'Invalid username or password.';
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Try to logout on server (don't throw if it fails - might be offline)
    try {
      await API.auth.logout();
    } catch (error) {
      console.log('Server logout failed (might be offline)');
    }
    
    // Clear local data
    await removeAuthToken();
    await removeUserData();
    
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export const register = async (data: {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  business_name: string;
  phone: string;
  address: string;
  gst_no: string; // REQUIRED - needed for password reset
}): Promise<{ success: boolean; error?: string; message?: string }> => {
  try {
    const response = await API.auth.register(data);
    
    return {
      success: true,
      message: response.message || 'Registration successful. Your vendor account is pending approval. Please wait for admin approval.',
    };
  } catch (error: any) {
    console.error('Registration failed:', error);
    
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response?.data) {
      if (error.response.data.details) {
        // Validation errors - format nicely
        const details = error.response.data.details;
        const errors = Object.entries(details)
          .map(([field, messages]: [string, any]) => {
            const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            const msgs = Array.isArray(messages) ? messages : [messages];
            return `${fieldName}: ${msgs.join(', ')}`;
          })
          .join('\n');
        errorMessage = errors;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return token !== null;
};

export const checkAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  userData: AuthData | null;
}> => {
  const token = await getAuthToken();
  const userData = await getUserData();
  
  return {
    isAuthenticated: token !== null,
    userData,
  };
};

// ==================== PASSWORD RESET ====================

export const forgotPassword = async (data: {
  username: string;
  gst_no: string;
}): Promise<{
  success: boolean;
  error?: string;
  data?: { username: string; gst_no: string; business_name: string };
}> => {
  try {
    const response = await API.auth.forgotPassword(data);
    
    return {
      success: true,
      data: {
        username: response.username,
        gst_no: response.gst_no,
        business_name: response.business_name,
      },
    };
  } catch (error: any) {
    console.error('Forgot password failed:', error);
    
    let errorMessage = 'Verification failed. Please try again.';
    
    if (error.response?.data) {
      if (error.response.data.details?.non_field_errors) {
        errorMessage = error.response.data.details.non_field_errors[0];
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

export const resetPassword = async (data: {
  username: string;
  gst_no: string;
  new_password: string;
  new_password_confirm: string;
}): Promise<{ success: boolean; error?: string; message?: string }> => {
  try {
    const response = await API.auth.resetPassword(data);
    
    return {
      success: true,
      message: response.message || 'Password reset successful. You can now login with your new password.',
    };
  } catch (error: any) {
    console.error('Password reset failed:', error);
    
    let errorMessage = 'Password reset failed. Please try again.';
    
    if (error.response?.data) {
      if (error.response.data.details) {
        // Format validation errors
        const details = error.response.data.details;
        const errors = Object.entries(details)
          .map(([field, messages]: [string, any]) => {
            const msgs = Array.isArray(messages) ? messages : [messages];
            return msgs.join(', ');
          })
          .join('\n');
        errorMessage = errors;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

export default {
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
  isAuthenticated,
  checkAuthStatus,
  saveAuthToken,
  getAuthToken,
  removeAuthToken,
  saveUserData,
  getUserData,
  removeUserData,
};
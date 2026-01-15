# Password Reset Implementation Guide

## Overview

This guide provides implementation details for the password reset flow using GST verification. This is a **future enhancement** that should be implemented after testing the current authentication fixes.

---

## Flow Diagram

```
┌─────────────────┐
│  Login Screen   │
│  "Forgot Pass?" │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ ForgotPasswordScreen    │
│ Step 1: Verify Identity │
│                         │
│ [Username Input]        │
│ [GST Number Input]      │
│ [Verify Button]         │
└────────┬────────────────┘
         │
         ▼
   API: POST /auth/forgot-password
   Body: { username, gst_no }
         │
         ▼
┌─────────────────────────┐
│ ResetPasswordScreen     │
│ Step 2: New Password    │
│                         │
│ Username: vendor1       │
│ GST: 29ABCDE***         │
│                         │
│ [New Password Input]    │
│ [Confirm Password]      │
│ [Reset Button]          │
└────────┬────────────────┘
         │
         ▼
   API: POST /auth/reset-password
   Body: { username, gst_no, new_password, new_password_confirm }
         │
         ▼
┌─────────────────────────┐
│  Success!               │
│  "Password reset"       │
│  [Go to Login]          │
└─────────────────────────┘
```

---

## Step 1: Create ForgotPasswordScreen

**File:** `src/screens/ForgotPasswordScreen.tsx`

### Features:
- Username input field
- GST number input field
- Verify button
- Back to login link
- Loading state
- Error handling

### Key Validation:
```typescript
- Username: required, trimmed
- GST Number: required, format validation (15 characters, specific pattern)
```

### API Call:
```typescript
POST /auth/forgot-password
{
  "username": "vendor1",
  "gst_no": "29ABCDE1234F1Z5"
}
```

### Success Response:
```json
{
  "message": "Username and GST number verified. You can now reset your password.",
  "username": "vendor1",
  "gst_no": "29ABCDE1234F1Z5",
  "business_name": "ABC Store"
}
```

### Error Responses:
```json
// Username not found
{
  "error": "Username and GST number verification failed",
  "details": {
    "non_field_errors": ["Username not found. Please check and try again."]
  }
}

// Username and GST don't match
{
  "error": "Username and GST number verification failed",
  "details": {
    "non_field_errors": ["Username and GST number do not match."]
  }
}

// Account pending approval
{
  "error": "Username and GST number verification failed",
  "details": {
    "non_field_errors": ["Your vendor account is pending approval. Please contact admin."]
  }
}
```

### Sample Code:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';
import API from '../services/api';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return false;
    }

    if (!gstNumber.trim()) {
      Alert.alert('Error', 'Please enter your GST number');
      return false;
    }

    // GST format validation
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber.trim())) {
      Alert.alert('Error', 'Please enter a valid GST number');
      return false;
    }

    return true;
  };

  const handleVerify = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.auth.forgotPassword({
        username: username.trim(),
        gst_no: gstNumber.trim(),
      });

      // Success - navigate to reset password screen
      navigation.navigate('ResetPassword', {
        username: username.trim(),
        gstNumber: gstNumber.trim(),
        businessName: response.business_name,
      });
    } catch (error: any) {
      console.error('Verification failed:', error);
      
      let errorMessage = 'Verification failed. Please try again.';
      
      if (error.response?.data) {
        if (error.response.data.details?.non_field_errors) {
          errorMessage = error.response.data.details.non_field_errors[0];
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your username and GST number to verify your identity
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              placeholderTextColor="#999999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* GST Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>GST Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter GST number"
              placeholderTextColor="#999999"
              value={gstNumber}
              onChangeText={setGstNumber}
              autoCapitalize="characters"
              editable={!isLoading}
            />
            <Text style={styles.helperText}>
              Your GST number is used to verify your identity
            </Text>
          </View>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Identity</Text>
          )}
        </TouchableOpacity>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Don't have a GST number on file?{'\n'}
            Contact support for assistance.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  backButton: {
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  helperText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  verifyButton: {
    height: 56,
    backgroundColor: '#C62828',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C62828',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  helpContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ForgotPasswordScreen;
```

---

## Step 2: Create ResetPasswordScreen

**File:** `src/screens/ResetPasswordScreen.tsx`

### Features:
- Display verified username and masked GST
- New password input field
- Confirm password input field
- Reset button
- Loading state
- Success/error handling

### Route Parameters:
```typescript
{
  username: string;
  gstNumber: string;
  businessName: string;
}
```

### Key Validation:
```typescript
- New Password: minimum 6 characters
- Confirm Password: must match new password
```

### API Call:
```typescript
POST /auth/reset-password
{
  "username": "vendor1",
  "gst_no": "29ABCDE1234F1Z5",
  "new_password": "newpassword123",
  "new_password_confirm": "newpassword123"
}
```

### Success Response:
```json
{
  "message": "Password reset successful. You can now login with your new password.",
  "username": "vendor1"
}
```

### Sample Code:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/business.types';
import API from '../services/api';

type ResetPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
  route: RouteProp<RootStackParamList, 'ResetPassword'>;
};

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const { username, gstNumber, businessName } = route.params;
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mask GST number for display (show only first 5 and last 3 characters)
  const maskedGst = gstNumber.substring(0, 5) + '****' + gstNumber.substring(12);

  const validateForm = (): boolean => {
    if (!newPassword) {
      Alert.alert('Error', 'Please enter new password');
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await API.auth.resetPassword({
        username: username,
        gst_no: gstNumber,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });

      // Success
      Alert.alert(
        '✅ Password Reset Successful',
        'Your password has been reset successfully. You can now login with your new password.',
        [
          {
            text: 'Go to Login',
            onPress: () => {
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error('Password reset failed:', error);
      
      let errorMessage = 'Password reset failed. Please try again.';
      
      if (error.response?.data) {
        if (error.response.data.details) {
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
      }
      
      Alert.alert('Reset Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Create a new password for your account</Text>
        </View>

        {/* Account Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username:</Text>
            <Text style={styles.infoValue}>{username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Business:</Text>
            <Text style={styles.infoValue}>{businessName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>GST:</Text>
            <Text style={styles.infoValue}>{maskedGst}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                placeholderTextColor="#999999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading}
              >
                <Text style={styles.eyeText}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Minimum 6 characters</Text>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm new password"
                placeholderTextColor="#999999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
          onPress={handleResetPassword}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.resetButtonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  infoCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    height: 50,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  eyeButton: {
    padding: 12,
  },
  eyeText: {
    fontSize: 20,
  },
  helperText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  resetButton: {
    height: 56,
    backgroundColor: '#C62828',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C62828',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ResetPasswordScreen;
```

---

## Step 3: Add API Methods

**File:** `src/services/api.ts`

Add these methods to the `auth` object:

```typescript
auth: {
  // ... existing methods ...

  forgotPassword: async (data: {
    username: string;
    gst_no: string;
  }): Promise<any> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: {
    username: string;
    gst_no: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<any> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
},
```

---

## Step 4: Update Navigation Types

**File:** `src/types/business.types.ts`

Add new routes to `RootStackParamList`:

```typescript
export type RootStackParamList = {
  // ... existing routes ...
  ForgotPassword: undefined;
  ResetPassword: {
    username: string;
    gstNumber: string;
    businessName: string;
  };
};
```

---

## Step 5: Register Routes in AppNavigator

**File:** `src/navigation/AppNavigator.tsx`

```typescript
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

// ... in the Stack.Navigator ...

<Stack.Screen
  name="ForgotPassword"
  component={ForgotPasswordScreen}
  options={{
    title: 'Forgot Password',
    headerShown: false,
  }}
/>
<Stack.Screen
  name="ResetPassword"
  component={ResetPasswordScreen}
  options={{
    title: 'Reset Password',
    headerShown: false,
  }}
/>
```

---

## Step 6: Update LoginScreen

**File:** `src/screens/LoginScreen.tsx`

Replace the `handleForgotPassword` function:

```typescript
const handleForgotPassword = () => {
  navigation.navigate('ForgotPassword');
};
```

---

## Testing Checklist

### Happy Path
- [ ] Click "Forgot Password?" on login screen
- [ ] Enter valid username and GST number
- [ ] Verify identity succeeds
- [ ] Navigate to reset password screen
- [ ] Enter new password (6+ characters)
- [ ] Confirm password matches
- [ ] Reset succeeds
- [ ] Navigate back to login
- [ ] Login with new password works

### Error Cases
- [ ] Username doesn't exist → Show error
- [ ] Username and GST don't match → Show error
- [ ] Account pending approval → Show error
- [ ] Account inactive → Show error
- [ ] Invalid GST format → Show validation error
- [ ] New password too short → Show error
- [ ] Passwords don't match → Show error
- [ ] Network error → Show retry option

### Edge Cases
- [ ] User cancels after verification (back button)
- [ ] User tries to go back from reset screen
- [ ] Multiple verification attempts
- [ ] Session timeout handling

---

## Security Considerations

### ✅ Good Practices
- GST number is required for identity verification
- Password is never sent in plain text over network
- All tokens are invalidated after password reset
- User must know both username AND GST number
- GST number is masked in display
- No password hints or recovery questions

### ⚠️ Limitations
- No email verification (GST-based verification only)
- No rate limiting on client side (rely on server)
- No CAPTCHA (should be added on server)

---

## Future Enhancements

1. **Email Notifications**
   - Send email when password is reset
   - Notify admin of password reset attempts

2. **Rate Limiting**
   - Limit verification attempts per username
   - Implement exponential backoff

3. **Account Lockout**
   - Temporarily lock account after X failed attempts
   - Require admin unlock

4. **Two-Factor Authentication**
   - SMS or email OTP verification
   - Authenticator app support

5. **Password Strength Meter**
   - Visual indicator of password strength
   - Suggestions for strong passwords

6. **Password History**
   - Prevent reusing recent passwords
   - Track password change history

---

## Summary

Implementing password reset requires:
1. ✅ ForgotPasswordScreen (verify username + GST)
2. ✅ ResetPasswordScreen (set new password)
3. ✅ API integration (forgot-password, reset-password endpoints)
4. ✅ Navigation setup
5. ✅ Error handling
6. ✅ Security best practices

All code samples are provided above and ready to implement!

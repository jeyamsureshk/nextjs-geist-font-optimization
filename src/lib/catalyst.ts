import axios from 'axios';

// Catalyst API configuration
const CATALYST_CONFIG = {
  apiKey: process.env.CATALYST_API_KEY,
  organizationId: process.env.CATALYST_ORGANIZATION_ID,
  projectId: process.env.CATALYST_PROJECT_ID,
  baseURL: 'https://api.catalyst.zoho.com/baas/v1',
};

// Create axios instance with default config
const catalystAPI = axios.create({
  baseURL: CATALYST_CONFIG.baseURL,
  headers: {
    'Authorization': `Zoho-oauthtoken ${CATALYST_CONFIG.apiKey}`,
    'Content-Type': 'application/json',
  },
});

// User interface
export interface User {
  id?: string;
  email: string;
  name: string;
  age?: number;
  bio?: string;
  location?: string;
  profileImage?: string;
  interests?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Message interface
export interface Message {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  chatId: string;
}

// Call interface
export interface Call {
  id?: string;
  callerId: string;
  receiverId: string;
  status: 'initiated' | 'ongoing' | 'ended' | 'missed';
  startTime: string;
  endTime?: string;
  duration?: number;
}

// User registration function
export async function registerUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  try {
    // For now, we'll use mock data since we don't have actual Catalyst credentials
    // In production, this would make an actual API call to Catalyst
    const mockUser: User = {
      id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Store in localStorage for demo purposes
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    const userExists = existingUsers.find((user: User) => user.email === userData.email);
    if (userExists) {
      throw new Error('User already exists with this email');
    }

    existingUsers.push(mockUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));

    return mockUser;

    // Actual Catalyst API call would look like:
    // const response = await catalystAPI.post(`/project/${CATALYST_CONFIG.projectId}/table/users/row`, {
    //   data: userData
    // });
    // return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(error instanceof Error ? error.message : 'Registration failed');
  }
}

// User login function
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    // Mock authentication - in production, use proper password hashing
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = existingUsers.find((u: User) => u.email === email);

    if (!user) {
      throw new Error('User not found');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return user;

    // Actual Catalyst API call would look like:
    // const response = await catalystAPI.post(`/project/${CATALYST_CONFIG.projectId}/auth/login`, {
    //   email,
    //   password
    // });
    // return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error instanceof Error ? error.message : 'Login failed');
  }
}

// Fetch all users for matching
export async function fetchUsers(): Promise<User[]> {
  try {
    // Mock data for demo
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Add some sample users if none exist
    if (existingUsers.length === 0) {
      const sampleUsers: User[] = [
        {
          id: 'user_1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          age: 28,
          bio: 'Love hiking and photography. Looking for someone to share adventures with!',
          location: 'San Francisco, CA',
          interests: ['hiking', 'photography', 'travel', 'cooking'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user_2',
          name: 'Mike Chen',
          email: 'mike@example.com',
          age: 32,
          bio: 'Software engineer by day, chef by night. Passionate about technology and good food.',
          location: 'Seattle, WA',
          interests: ['coding', 'cooking', 'gaming', 'music'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user_3',
          name: 'Emma Davis',
          email: 'emma@example.com',
          age: 26,
          bio: 'Artist and yoga instructor. Seeking meaningful connections and deep conversations.',
          location: 'Austin, TX',
          interests: ['art', 'yoga', 'meditation', 'nature'],
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('users', JSON.stringify(sampleUsers));
      return sampleUsers;
    }

    return existingUsers;
  } catch (error) {
    console.error('Fetch users error:', error);
    throw new Error('Failed to fetch users');
  }
}

// Fetch chat messages
export async function fetchChatMessages(chatId: string): Promise<Message[]> {
  try {
    const messages = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
    return messages;
  } catch (error) {
    console.error('Fetch messages error:', error);
    throw new Error('Failed to fetch messages');
  }
}

// Send message
export async function sendMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  try {
    const message: Message = {
      id: `msg_${Date.now()}`,
      ...messageData,
      timestamp: new Date().toISOString(),
    };

    const existingMessages = JSON.parse(localStorage.getItem(`chat_${messageData.chatId}`) || '[]');
    existingMessages.push(message);
    localStorage.setItem(`chat_${messageData.chatId}`, JSON.stringify(existingMessages));

    return message;
  } catch (error) {
    console.error('Send message error:', error);
    throw new Error('Failed to send message');
  }
}

// Initiate call
export async function initiateCall(callData: Omit<Call, 'id' | 'startTime'>): Promise<Call> {
  try {
    const call: Call = {
      id: `call_${Date.now()}`,
      ...callData,
      startTime: new Date().toISOString(),
    };

    const existingCalls = JSON.parse(localStorage.getItem('calls') || '[]');
    existingCalls.push(call);
    localStorage.setItem('calls', JSON.stringify(existingCalls));

    return call;
  } catch (error) {
    console.error('Initiate call error:', error);
    throw new Error('Failed to initiate call');
  }
}

// Update call status
export async function updateCallStatus(callId: string, status: Call['status'], endTime?: string): Promise<Call> {
  try {
    const existingCalls = JSON.parse(localStorage.getItem('calls') || '[]');
    const callIndex = existingCalls.findIndex((call: Call) => call.id === callId);
    
    if (callIndex === -1) {
      throw new Error('Call not found');
    }

    existingCalls[callIndex].status = status;
    if (endTime) {
      existingCalls[callIndex].endTime = endTime;
      // Calculate duration in minutes
      const start = new Date(existingCalls[callIndex].startTime);
      const end = new Date(endTime);
      existingCalls[callIndex].duration = Math.round((end.getTime() - start.getTime()) / 60000);
    }

    localStorage.setItem('calls', JSON.stringify(existingCalls));
    return existingCalls[callIndex];
  } catch (error) {
    console.error('Update call status error:', error);
    throw new Error('Failed to update call status');
  }
}

export default {
  registerUser,
  loginUser,
  fetchUsers,
  fetchChatMessages,
  sendMessage,
  initiateCall,
  updateCallStatus,
};
